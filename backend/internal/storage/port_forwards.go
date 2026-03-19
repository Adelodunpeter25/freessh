package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
)

type PortForwardStorage struct {
	db *sql.DB
}

func NewPortForwardStorage() (*PortForwardStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &PortForwardStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *PortForwardStorage) GetAll() []*models.PortForwardConfig {
	rows, err := s.db.Query(`
		SELECT id, name, connection_id, type, local_port, remote_host, remote_port, binding_address, auto_start
		FROM port_forwards
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	configs := make([]*models.PortForwardConfig, 0)
	for rows.Next() {
		config, err := scanPortForward(rows)
		if err != nil {
			continue
		}
		configs = append(configs, config)
	}

	return configs
}

func (s *PortForwardStorage) Get(id string) *models.PortForwardConfig {
	row := s.db.QueryRow(`
		SELECT id, name, connection_id, type, local_port, remote_host, remote_port, binding_address, auto_start
		FROM port_forwards WHERE id = ?
	`, id)

	config, err := scanPortForward(row)
	if err != nil {
		return nil
	}

	return config
}

func (s *PortForwardStorage) GetByConnection(connectionID string) []*models.PortForwardConfig {
	rows, err := s.db.Query(`
		SELECT id, name, connection_id, type, local_port, remote_host, remote_port, binding_address, auto_start
		FROM port_forwards WHERE connection_id = ?
	`, connectionID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	configs := make([]*models.PortForwardConfig, 0)
	for rows.Next() {
		config, err := scanPortForward(rows)
		if err != nil {
			continue
		}
		configs = append(configs, config)
	}

	return configs
}

func (s *PortForwardStorage) Add(config *models.PortForwardConfig) error {
	_, err := s.db.Exec(`
		INSERT INTO port_forwards (
			id, name, connection_id, type, local_port, remote_host, remote_port, binding_address, auto_start
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		config.ID,
		config.Name,
		config.ConnectionID,
		config.Type,
		config.LocalPort,
		nullIfEmpty(config.RemoteHost),
		config.RemotePort,
		nullIfEmpty(config.BindingAddress),
		boolToInt(config.AutoStart),
	)
	if err != nil {
		return fmt.Errorf("failed to add port forward: %w", err)
	}

	return nil
}

func (s *PortForwardStorage) Update(config *models.PortForwardConfig) error {
	result, err := s.db.Exec(`
		UPDATE port_forwards
		SET name = ?, connection_id = ?, type = ?, local_port = ?, remote_host = ?, remote_port = ?, binding_address = ?, auto_start = ?
		WHERE id = ?
	`,
		config.Name,
		config.ConnectionID,
		config.Type,
		config.LocalPort,
		nullIfEmpty(config.RemoteHost),
		config.RemotePort,
		nullIfEmpty(config.BindingAddress),
		boolToInt(config.AutoStart),
		config.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update port forward: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("port forward config not found")
	}
	return nil
}

func (s *PortForwardStorage) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM port_forwards WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete port forward: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("port forward config not found")
	}
	return nil
}

func (s *PortForwardStorage) migrateFromJSON() error {
	count, err := s.countRows()
	if err != nil || count > 0 {
		return err
	}

	manager, err := NewManager("port_forwards.json")
	if err != nil || !manager.Exists() {
		return err
	}

	var configs []*models.PortForwardConfig
	if err := manager.Load(&configs); err != nil {
		return err
	}

	for _, config := range configs {
		if err := s.Add(config); err != nil {
			return err
		}
	}

	return nil
}

func (s *PortForwardStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM port_forwards`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanPortForward(scanner interface {
	Scan(dest ...any) error
}) (*models.PortForwardConfig, error) {
	config := &models.PortForwardConfig{}
	var autoStart int
	if err := scanner.Scan(
		&config.ID,
		&config.Name,
		&config.ConnectionID,
		&config.Type,
		&config.LocalPort,
		&config.RemoteHost,
		&config.RemotePort,
		&config.BindingAddress,
		&autoStart,
	); err != nil {
		return nil, err
	}
	config.AutoStart = autoStart != 0
	return config, nil
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}
