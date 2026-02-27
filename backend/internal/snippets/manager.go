package snippets

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"

	"github.com/google/uuid"
)

type Manager struct {
	storage *storage.SnippetStorage
}

func NewManager(storage *storage.SnippetStorage) *Manager {
	return &Manager{
		storage: storage,
	}
}

func (m *Manager) List() ([]models.Snippet, error) {
	return m.storage.List(), nil
}

func (m *Manager) Get(id string) (*models.Snippet, error) {
	return m.storage.Get(id)
}

func (m *Manager) Create(name, command string) (*models.Snippet, error) {
	snippet := models.Snippet{
		ID:        uuid.New().String(),
		Name:      name,
		Command:   command,
		CreatedAt: time.Now(),
	}

	if err := m.storage.Create(snippet); err != nil {
		return nil, err
	}

	return &snippet, nil
}

func (m *Manager) Update(id, name, command string) (*models.Snippet, error) {
	existing, err := m.storage.Get(id)
	if err != nil {
		return nil, err
	}

	snippet := models.Snippet{
		ID:        id,
		Name:      name,
		Command:   command,
		CreatedAt: existing.CreatedAt,
	}

	if err := m.storage.Update(snippet); err != nil {
		return nil, err
	}

	return &snippet, nil
}

func (m *Manager) Delete(id string) error {
	return m.storage.Delete(id)
}
