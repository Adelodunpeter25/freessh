package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"

	"github.com/google/uuid"
)

type KnownHostStorage struct {
	db *sql.DB
}

func NewKnownHostStorage() (*KnownHostStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &KnownHostStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *KnownHostStorage) GetAll() []*models.KnownHost {
	rows, err := s.db.Query(`
		SELECT id, hostname, port, fingerprint, publicKey
		FROM known_hosts
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	hosts := make([]*models.KnownHost, 0)
	for rows.Next() {
		host, err := scanKnownHost(rows)
		if err != nil {
			continue
		}
		hosts = append(hosts, host)
	}
	return hosts
}

func (s *KnownHostStorage) Get(hostname string, port int) *models.KnownHost {
	row := s.db.QueryRow(`
		SELECT id, hostname, port, fingerprint, publicKey
		FROM known_hosts WHERE hostname = ? AND port = ?
	`, hostname, port)

	host, err := scanKnownHost(row)
	if err != nil {
		return nil
	}
	return host
}

func (s *KnownHostStorage) Add(host *models.KnownHost) error {
	if host.ID == "" {
		host.ID = uuid.New().String()
	}

	_, err := s.db.Exec(`
		INSERT INTO known_hosts (id, hostname, port, fingerprint, publicKey)
		VALUES (?, ?, ?, ?, ?)
	`, host.ID, host.Hostname, host.Port, host.Fingerprint, host.PublicKey)
	if err != nil {
		return fmt.Errorf("failed to add known host: %w", err)
	}
	return nil
}

func (s *KnownHostStorage) Update(host *models.KnownHost) error {
	result, err := s.db.Exec(`
		UPDATE known_hosts
		SET hostname = ?, port = ?, fingerprint = ?, publicKey = ?
		WHERE id = ?
	`, host.Hostname, host.Port, host.Fingerprint, host.PublicKey, host.ID)
	if err != nil {
		return fmt.Errorf("failed to update known host: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("host not found")
	}
	return nil
}

func (s *KnownHostStorage) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM known_hosts WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete known host: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("host not found")
	}
	return nil
}

func (s *KnownHostStorage) DeleteByHostname(hostname string, port int) error {
	result, err := s.db.Exec(`DELETE FROM known_hosts WHERE hostname = ? AND port = ?`, hostname, port)
	if err != nil {
		return fmt.Errorf("failed to delete known host: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("host not found")
	}
	return nil
}

func (s *KnownHostStorage) migrateFromJSON() error {
	tracker, err := NewMigrationTracker()
	if err != nil {
		return err
	}
	if tracker.IsDone("known_hosts") {
		return nil
	}
	count, err := s.countRows()
	if err != nil {
		return err
	}
	if count > 0 {
		return tracker.MarkDone("known_hosts")
	}

	manager, err := NewManager("known_hosts.json")
	if err != nil || !manager.Exists() {
		if err != nil {
			return err
		}
		return tracker.MarkDone("known_hosts")
	}

	var hosts []*models.KnownHost
	if err := manager.Load(&hosts); err != nil {
		return err
	}

	for _, host := range hosts {
		if err := s.Add(host); err != nil {
			return err
		}
	}

	return tracker.MarkDone("known_hosts")
}

func (s *KnownHostStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM known_hosts`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanKnownHost(scanner interface {
	Scan(dest ...any) error
}) (*models.KnownHost, error) {
	host := &models.KnownHost{}
	if err := scanner.Scan(&host.ID, &host.Hostname, &host.Port, &host.Fingerprint, &host.PublicKey); err != nil {
		return nil, err
	}
	return host, nil
}
