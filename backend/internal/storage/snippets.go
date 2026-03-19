package storage

import (
	"database/sql"
	"fmt"
	"freessh-backend/internal/db"
	"freessh-backend/internal/models"
	"time"
)

type SnippetStorage struct {
	db *sql.DB
}

func NewSnippetStorage() (*SnippetStorage, error) {
	database, err := db.Open()
	if err != nil {
		return nil, err
	}

	storage := &SnippetStorage{
		db: database,
	}

	if err := storage.migrateFromJSON(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *SnippetStorage) List() []models.Snippet {
	rows, err := s.db.Query(`
		SELECT id, name, command, created_at
		FROM snippets
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	snippets := make([]models.Snippet, 0)
	for rows.Next() {
		snippet, err := scanSnippet(rows)
		if err != nil {
			continue
		}
		snippets = append(snippets, snippet)
	}

	return snippets
}

func (s *SnippetStorage) Get(id string) (*models.Snippet, error) {
	row := s.db.QueryRow(`
		SELECT id, name, command, created_at
		FROM snippets WHERE id = ?
	`, id)

	snippet, err := scanSnippet(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("snippet not found: %s", id)
		}
		return nil, err
	}

	return &snippet, nil
}

func (s *SnippetStorage) Create(snippet models.Snippet) error {
	if snippet.CreatedAt.IsZero() {
		snippet.CreatedAt = time.Now()
	}

	_, err := s.db.Exec(`
		INSERT INTO snippets (id, name, command, created_at)
		VALUES (?, ?, ?, ?)
	`, snippet.ID, snippet.Name, snippet.Command, formatTime(snippet.CreatedAt))
	if err != nil {
		return fmt.Errorf("failed to create snippet: %w", err)
	}
	return nil
}

func (s *SnippetStorage) Update(snippet models.Snippet) error {
	result, err := s.db.Exec(`
		UPDATE snippets SET name = ?, command = ?, created_at = ?
		WHERE id = ?
	`, snippet.Name, snippet.Command, formatTime(snippet.CreatedAt), snippet.ID)
	if err != nil {
		return fmt.Errorf("failed to update snippet: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("snippet not found: %s", snippet.ID)
	}
	return nil
}

func (s *SnippetStorage) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM snippets WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete snippet: %w", err)
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("snippet not found: %s", id)
	}
	return nil
}

func (s *SnippetStorage) migrateFromJSON() error {
	count, err := s.countRows()
	if err != nil || count > 0 {
		return err
	}

	manager, err := NewManager("snippets.json")
	if err != nil || !manager.Exists() {
		return err
	}

	var snippets []models.Snippet
	if err := manager.Load(&snippets); err != nil {
		return err
	}

	for _, snippet := range snippets {
		if err := s.Create(snippet); err != nil {
			return err
		}
	}

	return nil
}

func (s *SnippetStorage) countRows() (int, error) {
	row := s.db.QueryRow(`SELECT COUNT(*) FROM snippets`)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func scanSnippet(scanner interface {
	Scan(dest ...any) error
}) (models.Snippet, error) {
	var (
		id        string
		name      string
		command   string
		createdAt sql.NullString
	)

	if err := scanner.Scan(&id, &name, &command, &createdAt); err != nil {
		return models.Snippet{}, err
	}

	parsedCreatedAt, _ := parseTime(createdAt.String)

	return models.Snippet{
		ID:        id,
		Name:      name,
		Command:   command,
		CreatedAt: parsedCreatedAt,
	}, nil
}
