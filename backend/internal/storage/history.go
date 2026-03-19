package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
	"freessh-backend/internal/utils"
)

type HistoryStorage struct {
	db *sql.DB
}

func NewHistoryStorage() (*HistoryStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &HistoryStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *HistoryStorage) List() []models.HistoryEntry {
	rows, err := s.db.Query(`
		SELECT id, command FROM history ORDER BY rowid DESC
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	entries := make([]models.HistoryEntry, 0)
	for rows.Next() {
		var entry models.HistoryEntry
		if err := rows.Scan(&entry.ID, &entry.Command); err != nil {
			continue
		}
		entries = append(entries, entry)
	}

	return entries
}

func (s *HistoryStorage) Add(entry models.HistoryEntry) (bool, error) {
	return s.AddWithConnection(entry, "")
}

func (s *HistoryStorage) AddWithConnection(entry models.HistoryEntry, connectionID string) (bool, error) {
	normalized := utils.NormalizeHistoryCommand(entry.Command)
	if normalized == "" {
		return false, nil
	}
	entry.Command = normalized

	var lastCommand sql.NullString
	row := s.db.QueryRow(`SELECT command FROM history ORDER BY rowid DESC LIMIT 1`)
	_ = row.Scan(&lastCommand)
	if lastCommand.Valid && utils.NormalizeHistoryCommand(lastCommand.String) == normalized {
		return false, nil
	}

	var connValue interface{}
	if connectionID != "" {
		connValue = connectionID
	}
	_, err := s.db.Exec(`INSERT INTO history (id, command, connection_id) VALUES (?, ?, ?)`, entry.ID, entry.Command, connValue)
	if err != nil {
		return false, fmt.Errorf("failed to insert history: %w", err)
	}

	if err := s.trimHistory(); err != nil {
		return true, err
	}

	return true, nil
}

func (s *HistoryStorage) Clear() error {
	_, err := s.db.Exec(`DELETE FROM history`)
	if err != nil {
		return fmt.Errorf("failed to clear history: %w", err)
	}
	return nil
}

func (s *HistoryStorage) GetRecent(limit int) []models.HistoryEntry {
	if limit <= 0 {
		return nil
	}

	rows, err := s.db.Query(`
		SELECT id, command FROM history ORDER BY rowid DESC LIMIT ?
	`, limit)
	if err != nil {
		return nil
	}
	defer rows.Close()

	entries := make([]models.HistoryEntry, 0)
	for rows.Next() {
		var entry models.HistoryEntry
		if err := rows.Scan(&entry.ID, &entry.Command); err != nil {
			continue
		}
		entries = append(entries, entry)
	}

	return entries
}

func (s *HistoryStorage) trimHistory() error {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM history`)
	var count int
	if err := row.Scan(&count); err != nil {
		return err
	}
	if count <= 200 {
		return nil
	}
	excess := count - 200
	_, err := s.db.Exec(`
		DELETE FROM history WHERE rowid IN (
			SELECT rowid FROM history ORDER BY rowid ASC LIMIT ?
		)
	`, excess)
	return err
}

func (s *HistoryStorage) migrateFromJSON() error {
	tracker, err := NewMigrationTracker()
	if err != nil {
		return err
	}
	if tracker.IsDone("history") {
		return nil
	}
	count, err := s.countRows()
	if err != nil {
		return err
	}
	if count > 0 {
		return tracker.MarkDone("history")
	}

	manager, err := NewManager("history.json")
	if err != nil || !manager.Exists() {
		if err != nil {
			return err
		}
		return tracker.MarkDone("history")
	}

	var entries []models.HistoryEntry
	if err := manager.Load(&entries); err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.ID == "" {
			continue
		}
		_, _ = s.db.Exec(`INSERT INTO history (id, command, connection_id) VALUES (?, ?, ?)`, entry.ID, entry.Command, nil)
	}

	if err := s.trimHistory(); err != nil {
		return err
	}
	return tracker.MarkDone("history")
}

func (s *HistoryStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM history`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
