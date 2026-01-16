package session

import "freessh-backend/internal/models"
import "fmt"

func (m *Manager) ListSavedConnections() ([]models.ConnectionConfig, error) {
	if m.storage == nil {
		return nil, fmt.Errorf("storage not available")
	}

	return m.storage.List(), nil
}

func (m *Manager) GetSavedConnection(id string) (*models.ConnectionConfig, error) {
	if m.storage == nil {
		return nil, fmt.Errorf("storage not available")
	}

	return m.storage.Get(id)
}

func (m *Manager) DeleteSavedConnection(id string) error {
	if m.storage == nil {
		return fmt.Errorf("storage not available")
	}

	return m.storage.Delete(id)
}

func (m *Manager) UpdateSavedConnection(config models.ConnectionConfig) error {
	if m.storage == nil {
		return fmt.Errorf("storage not available")
	}

	return m.storage.Update(config)
}
