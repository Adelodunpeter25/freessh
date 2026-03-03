package history

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"freessh-backend/internal/utils"

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
	// Normalize command before dedupe/storage checks.
	command = utils.NormalizeHistoryCommand(command)

	// Ignore empty commands
	if command == "" {
		return nil, nil
	}

	// Ignore common control sequences
	if command == "clear" || command == "exit" || command == "logout" {
		return nil, nil
	}

	// Fast-path duplicate check against a short recent window to absorb
	// shell hook retries and split marker replays.
	if !utils.ShouldAddToHistory(command, m.storage.GetRecent(10)) {
		return nil, nil
	}

	entry := models.HistoryEntry{
		ID:      uuid.New().String(),
		Command: command,
	}

	added, err := m.storage.Add(entry)
	if err != nil {
		return nil, err
	}
	if !added {
		return nil, nil
	}

	return &entry, nil
}

func (m *Manager) Clear() error {
	return m.storage.Clear()
}

func (m *Manager) GetRecent(limit int) ([]models.HistoryEntry, error) {
	return m.storage.GetRecent(limit), nil
}
