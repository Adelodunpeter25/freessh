package groups

import (
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type Manager struct {
	groupStorage      *storage.GroupStorage
	connectionStorage *storage.ConnectionStorage
}

func NewManager(groupStorage *storage.GroupStorage, connectionStorage *storage.ConnectionStorage) *Manager {
	return &Manager{
		groupStorage:      groupStorage,
		connectionStorage: connectionStorage,
	}
}

func (m *Manager) Create(name string) (*models.Group, error) {
	// Check if group with same name exists
	if _, err := m.groupStorage.GetByName(name); err == nil {
		return nil, fmt.Errorf("group with name '%s' already exists", name)
	}

	group, err := NewGroup(name)
	if err != nil {
		return nil, err
	}

	if err := m.groupStorage.Create(group.Group); err != nil {
		return nil, err
	}

	return &group.Group, nil
}

func (m *Manager) Rename(id, newName string) error {
	// Check if new name already exists
	if existing, err := m.groupStorage.GetByName(newName); err == nil && existing.ID != id {
		return fmt.Errorf("group with name '%s' already exists", newName)
	}

	group, err := m.groupStorage.Get(id)
	if err != nil {
		return err
	}

	oldName := group.Name
	group.Name = newName

	if err := m.groupStorage.Update(*group); err != nil {
		return err
	}

	// Update all connections with this group name
	return m.connectionStorage.UpdateGroupName(oldName, newName)
}

func (m *Manager) Delete(id string) error {
	group, err := m.groupStorage.Get(id)
	if err != nil {
		return err
	}

	// Remove group from all connections
	if err := m.connectionStorage.RemoveGroup(group.Name); err != nil {
		return err
	}

	return m.groupStorage.Delete(id)
}

func (m *Manager) Get(id string) (*models.Group, error) {
	return m.groupStorage.Get(id)
}

func (m *Manager) List() ([]models.Group, error) {
	groups := m.groupStorage.List()
	
	// Get all connections
	connections := m.connectionStorage.List()

	// Count connections per group name
	counts := make(map[string]int)
	for _, conn := range connections {
		if conn.Group != "" {
			counts[conn.Group]++
		}
	}

	// Add counts to groups
	for i := range groups {
		groups[i].ConnectionCount = counts[groups[i].Name]
	}

	return groups, nil
}
