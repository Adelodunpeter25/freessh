package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
	"time"
)

type GroupStorage struct {
	db *sql.DB
}

func NewGroupStorage() (*GroupStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &GroupStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *GroupStorage) Create(group models.Group) error {
	if group.CreatedAt.IsZero() {
		group.CreatedAt = time.Now()
	}

	_, err := s.db.Exec(`
		INSERT INTO groups (id, name, connection_count, created_at)
		VALUES (?, ?, ?, ?)
	`, group.ID, group.Name, group.ConnectionCount, formatTime(group.CreatedAt))
	if err != nil {
		return fmt.Errorf("failed to create group: %w", err)
	}
	return nil
}

func (s *GroupStorage) Get(id string) (*models.Group, error) {
	row := s.db.QueryRow(`
		SELECT id, name, connection_count, created_at
		FROM groups WHERE id = ?
	`, id)

	group, err := scanGroup(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("group not found: %s", id)
		}
		return nil, err
	}

	return &group, nil
}

func (s *GroupStorage) GetByName(name string) (*models.Group, error) {
	row := s.db.QueryRow(`
		SELECT id, name, connection_count, created_at
		FROM groups WHERE name = ?
	`, name)

	group, err := scanGroup(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("group not found: %s", name)
		}
		return nil, err
	}

	return &group, nil
}

func (s *GroupStorage) List() []models.Group {
	rows, err := s.db.Query(`
		SELECT id, name, connection_count, created_at
		FROM groups
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	groups := make([]models.Group, 0)
	for rows.Next() {
		group, err := scanGroup(rows)
		if err != nil {
			continue
		}
		groups = append(groups, group)
	}

	return groups
}

func (s *GroupStorage) Update(group models.Group) error {
	result, err := s.db.Exec(`
		UPDATE groups SET name = ?, connection_count = ?, created_at = ?
		WHERE id = ?
	`, group.Name, group.ConnectionCount, formatTime(group.CreatedAt), group.ID)
	if err != nil {
		return fmt.Errorf("failed to update group: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("group not found: %s", group.ID)
	}
	return nil
}

func (s *GroupStorage) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM groups WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete group: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("group not found: %s", id)
	}
	return nil
}

func (s *GroupStorage) migrateFromJSON() error {
	tracker, err := NewMigrationTracker()
	if err != nil {
		return err
	}
	if tracker.IsDone("groups") {
		return nil
	}
	count, err := s.countRows()
	if err != nil {
		return err
	}
	if count > 0 {
		return tracker.MarkDone("groups")
	}

	manager, err := NewManager("groups.json")
	if err != nil || !manager.Exists() {
		if err != nil {
			return err
		}
		return tracker.MarkDone("groups")
	}

	var groups []models.Group
	if err := manager.Load(&groups); err != nil {
		return err
	}

	for _, group := range groups {
		if err := s.Create(group); err != nil {
			return err
		}
	}

	return tracker.MarkDone("groups")
}

func (s *GroupStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM groups`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanGroup(scanner interface {
	Scan(dest ...any) error
}) (models.Group, error) {
	var (
		id              string
		name            string
		connectionCount int
		createdAt       sql.NullString
	)

	if err := scanner.Scan(&id, &name, &connectionCount, &createdAt); err != nil {
		return models.Group{}, err
	}

	parsedCreatedAt, _ := parseTime(createdAt.String)

	return models.Group{
		ID:              id,
		Name:            name,
		ConnectionCount: connectionCount,
		CreatedAt:       parsedCreatedAt,
	}, nil
}
