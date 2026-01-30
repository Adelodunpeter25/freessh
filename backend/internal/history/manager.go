package history

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"strings"

	"github.com/google/uuid"
)

type Manager struct {
	storage *storage.HistoryStorage
}

func NewManager(storage *storage.HistoryStorage) *Manager {
	return &Manager{
		storage: storage,
	}
}

func (m *Manager) List() ([]models.HistoryEntry, error) {
	return m.storage.List(), nil
}

func (m *Manager) Add(command string) (*models.HistoryEntry, error) {
	// Trim whitespace and newlines
	command = strings.TrimSpace(command)

	// Ignore empty commands
	if command == "" {
		return nil, nil
	}

	// Ignore common control sequences
	if command == "clear" || command == "exit" || command == "logout" {
		return nil, nil
	}

	entry := models.HistoryEntry{
		ID:      uuid.New().String(),
		Command: command,
	}

	if err := m.storage.Add(entry); err != nil {
		return nil, err
	}

	return &entry, nil
}

func (m *Manager) Clear() error {
	return m.storage.Clear()
}

func (m *Manager) GetRecent(limit int) ([]models.HistoryEntry, error) {
	return m.storage.GetRecent(limit), nil
}
