package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
	"time"
)

type KeyStorage struct {
	db *sql.DB
}

func NewKeyStorage() (*KeyStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &KeyStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *KeyStorage) Save(key models.SSHKey) error {
	if key.CreatedAt.IsZero() {
		key.CreatedAt = time.Now()
	}

	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO ssh_keys (
			id, name, algorithm, bits, publicKey, private_key, passphrase, createdAt
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`,
		key.ID,
		key.Name,
		key.Algorithm,
		key.Bits,
		nullIfEmpty(key.PublicKey),
		nil,
		nil,
		formatTime(key.CreatedAt),
	)
	if err != nil {
		return fmt.Errorf("failed to save key: %w", err)
	}

	return nil
}

func (s *KeyStorage) Get(id string) (*models.SSHKey, error) {
	row := s.db.QueryRow(`
		SELECT id, name, algorithm, bits, publicKey, createdAt
		FROM ssh_keys WHERE id = ?
	`, id)

	key, err := scanKey(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("key not found: %s", id)
		}
		return nil, err
	}

	return &key, nil
}

func (s *KeyStorage) List() []models.SSHKey {
	rows, err := s.db.Query(`
		SELECT id, name, algorithm, bits, publicKey, createdAt
		FROM ssh_keys
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	keys := make([]models.SSHKey, 0)
	for rows.Next() {
		key, err := scanKey(rows)
		if err != nil {
			continue
		}
		keys = append(keys, key)
	}

	return keys
}

func (s *KeyStorage) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM ssh_keys WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete key: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("key not found: %s", id)
	}
	return nil
}

func (s *KeyStorage) Update(key models.SSHKey) error {
	_, err := s.Get(key.ID)
	if err != nil {
		return err
	}

	return s.Save(key)
}

func (s *KeyStorage) migrateFromJSON() error {
	count, err := s.countRows()
	if err != nil || count > 0 {
		return err
	}

	manager, err := NewManager("keys.json")
	if err != nil || !manager.Exists() {
		return err
	}

	var keys []models.SSHKey
	if err := manager.Load(&keys); err != nil {
		return err
	}

	for _, key := range keys {
		if err := s.Save(key); err != nil {
			return err
		}
	}

	return nil
}

func (s *KeyStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM ssh_keys`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanKey(scanner interface {
	Scan(dest ...any) error
}) (models.SSHKey, error) {
	var (
		id        string
		name      string
		algorithm string
		bits      int
		publicKey sql.NullString
		createdAt sql.NullString
	)

	if err := scanner.Scan(&id, &name, &algorithm, &bits, &publicKey, &createdAt); err != nil {
		return models.SSHKey{}, err
	}

	parsedCreatedAt, _ := parseTime(createdAt.String)

	return models.SSHKey{
		ID:        id,
		Name:      name,
		Algorithm: algorithm,
		Bits:      bits,
		PublicKey: publicKey.String,
		CreatedAt: parsedCreatedAt,
	}, nil
}
