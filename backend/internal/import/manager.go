package importpkg

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"os"
)

type Manager struct {
	connectionStorage *storage.Manager
	groupStorage      *storage.GroupStorage
	pfStorage         *storage.PortForwardStorage
}

func NewManager(connStorage *storage.Manager, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *Manager {
	return &Manager{
		connectionStorage: connStorage,
		groupStorage:      groupStorage,
		pfStorage:         pfStorage,
	}
}

type ImportResult struct {
	ConnectionsImported int      `json:"connections_imported"`
	GroupsImported      int      `json:"groups_imported"`
	PortForwardsImported int     `json:"port_forwards_imported"`
	Errors              []string `json:"errors,omitempty"`
}

func (m *Manager) Import(format string, data []byte) (*ImportResult, error) {
	switch format {
	case "freessh":
		return m.importFreeSSH(data)
	default:
		return nil, fmt.Errorf("unsupported import format: %s", format)
	}
}

func (m *Manager) ImportFromFile(format, filepath string) (*ImportResult, error) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	return m.Import(format, data)
}

func (m *Manager) importFreeSSH(data []byte) (*ImportResult, error) {
	var importData struct {
		Version      string                       `json:"version"`
		Connections  []models.ConnectionConfig    `json:"connections"`
		Groups       []models.Group               `json:"groups"`
		PortForwards []models.PortForwardConfig   `json:"port_forwards"`
	}

	if err := json.Unmarshal(data, &importData); err != nil {
		return nil, fmt.Errorf("failed to parse import data: %w", err)
	}

	result := &ImportResult{}

	// Import groups first
	for _, group := range importData.Groups {
		if err := m.groupStorage.Add(&group); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import group %s: %v", group.Name, err))
		} else {
			result.GroupsImported++
		}
	}

	// Import connections
	for _, conn := range importData.Connections {
		if err := m.connectionStorage.Save(conn); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import connection %s: %v", conn.Name, err))
		} else {
			result.ConnectionsImported++
		}
	}

	// Import port forwards
	for _, pf := range importData.PortForwards {
		if err := m.pfStorage.Add(&pf); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import port forward %s: %v", pf.Name, err))
		} else {
			result.PortForwardsImported++
		}
	}

	return result, nil
}
