package storage

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
	"log"

	"github.com/google/uuid"
)

type ConnectionStorage struct {
	db *sql.DB
}

func NewConnectionStorage() (*ConnectionStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &ConnectionStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *ConnectionStorage) Save(config models.ConnectionConfig) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("connection storage unavailable")
	}
	if config.ID == "" {
		config.ID = uuid.New().String()
	}
	if config.AuthMethod == "" {
		if config.KeyID != "" || config.PrivateKey != "" {
			config.AuthMethod = models.AuthPublicKey
		} else {
			config.AuthMethod = models.AuthPassword
		}
	}
	if config.Port == 0 {
		config.Port = 22
	}

	config.Profile = models.NormalizeSessionProfile(config.Profile)
	profileJSON := ""
	if config.Profile != nil {
		encoded, err := json.Marshal(config.Profile)
		if err != nil {
			return fmt.Errorf("failed to marshal profile: %w", err)
		}
		profileJSON = string(encoded)
	}

	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO connections (
			id, name, host, port, username, auth_method, private_key, passphrase, key_id, password, "group", profile
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		config.ID,
		config.Name,
		config.Host,
		config.Port,
		config.Username,
		string(config.AuthMethod),
		nullIfEmpty(config.PrivateKey),
		nullIfEmpty(config.Passphrase),
		nullIfEmpty(config.KeyID),
		nullIfEmpty(config.Password),
		nullIfEmpty(config.Group),
		nullIfEmpty(profileJSON),
	)
	if err != nil {
		return fmt.Errorf("failed to save connection: %w", err)
	}

	return nil
}

func (s *ConnectionStorage) Get(id string) (*models.ConnectionConfig, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("connection storage unavailable")
	}
	row := s.db.QueryRow(`
		SELECT id, name, host, port, username, auth_method, private_key, passphrase, key_id, password, "group", profile
		FROM connections WHERE id = ?
	`, id)

	conn, err := scanConnection(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("connection not found: %s", id)
		}
		return nil, err
	}

	return &conn, nil
}

func (s *ConnectionStorage) List() []models.ConnectionConfig {
	if s == nil || s.db == nil {
		return nil
	}
	rows, err := s.db.Query(`
		SELECT id, name, host, port, username, auth_method, private_key, passphrase, key_id, password, "group", profile
		FROM connections
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	connections := make([]models.ConnectionConfig, 0)
	for rows.Next() {
		conn, err := scanConnection(rows)
		if err != nil {
			continue
		}
		connections = append(connections, conn)
	}

	return connections
}

func (s *ConnectionStorage) Delete(id string) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("connection storage unavailable")
	}
	result, err := s.db.Exec(`DELETE FROM connections WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete connection: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("connection not found: %s", id)
	}
	return nil
}

func (s *ConnectionStorage) Update(config models.ConnectionConfig) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("connection storage unavailable")
	}
	if config.ID == "" {
		return fmt.Errorf("connection ID is required")
	}

	_, err := s.Get(config.ID)
	if err != nil {
		return err
	}

	return s.Save(config)
}

func (s *ConnectionStorage) UpdateGroupName(oldName, newName string) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("connection storage unavailable")
	}
	_, err := s.db.Exec(`UPDATE connections SET "group" = ? WHERE "group" = ?`, newName, oldName)
	if err != nil {
		return fmt.Errorf("failed to update group name: %w", err)
	}
	return nil
}

func (s *ConnectionStorage) RemoveGroup(groupName string) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("connection storage unavailable")
	}
	_, err := s.db.Exec(`UPDATE connections SET "group" = NULL WHERE "group" = ?`, groupName)
	if err != nil {
		return fmt.Errorf("failed to remove group: %w", err)
	}
	return nil
}

func (s *ConnectionStorage) migrateFromJSON() error {
	if s == nil || s.db == nil {
		return nil
	}
	count, err := s.countRows()
	if err != nil || count > 0 {
		return err
	}

	manager, err := NewManager("connections.json")
	if err != nil || !manager.Exists() {
		return err
	}

	var connections []models.ConnectionConfig
	if err := manager.Load(&connections); err != nil {
		log.Printf("Failed to load connections.json for migration: %v", err)
		return nil
	}

	for _, conn := range connections {
		if err := s.Save(conn); err != nil {
			log.Printf("Failed to migrate connection %s: %v", conn.ID, err)
			continue
		}
	}

	return nil
}

func (s *ConnectionStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM connections`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanConnection(scanner interface {
	Scan(dest ...any) error
}) (models.ConnectionConfig, error) {
	var (
		id          string
		name        string
		host        string
		port        int
		username    string
		authMethod  string
		privateKey  sql.NullString
		passphrase  sql.NullString
		keyID       sql.NullString
		password    sql.NullString
		group       sql.NullString
		profileJSON sql.NullString
	)

	if err := scanner.Scan(
		&id,
		&name,
		&host,
		&port,
		&username,
		&authMethod,
		&privateKey,
		&passphrase,
		&keyID,
		&password,
		&group,
		&profileJSON,
	); err != nil {
		return models.ConnectionConfig{}, err
	}

	var profile *models.SessionProfile
	if profileJSON.Valid && profileJSON.String != "" {
		var parsed models.SessionProfile
		if err := json.Unmarshal([]byte(profileJSON.String), &parsed); err == nil {
			profile = &parsed
		}
	}

	config := models.ConnectionConfig{
		ID:         id,
		Name:       name,
		Host:       host,
		Port:       port,
		Username:   username,
		AuthMethod: models.AuthMethod(authMethod),
		PrivateKey: privateKey.String,
		KeyID:      keyID.String,
		Group:      group.String,
		Profile:    models.NormalizeSessionProfile(profile),
	}

	if passphrase.Valid {
		config.Passphrase = passphrase.String
	}
	if password.Valid {
		config.Password = password.String
	}

	return config, nil
}
