package export

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"os"
	"time"
)

type Manager struct {
	connectionStorage *storage.ConnectionStorage
	groupStorage      *storage.GroupStorage
	pfStorage         *storage.PortForwardStorage
}

func NewManager(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *Manager {
	return &Manager{
		connectionStorage: connStorage,
		groupStorage:      groupStorage,
		pfStorage:         pfStorage,
	}
}

type ExportData struct {
	Version     string                       `json:"version"`
	ExportedAt  time.Time                    `json:"exported_at"`
	Connections []models.ConnectionConfig    `json:"connections"`
	Groups      []models.Group               `json:"groups"`
	PortForwards []models.PortForwardConfig  `json:"port_forwards"`
}

func (m *Manager) Export(format string) ([]byte, error) {
	switch format {
	case "freessh":
		return m.exportFreeSSH()
	default:
		return nil, fmt.Errorf("unsupported export format: %s", format)
	}
}

func (m *Manager) ExportToFile(format, filepath string) error {
	data, err := m.Export(format)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath, data, 0644)
}

func (m *Manager) exportFreeSSH() ([]byte, error) {
	connections := m.connectionStorage.List()
	groups := m.groupStorage.List()
	portForwards := m.pfStorage.GetAll()

	// Convert pointer slice to value slice
	pfConfigs := make([]models.PortForwardConfig, len(portForwards))
	for i, pf := range portForwards {
		pfConfigs[i] = *pf
	}

	exportData := ExportData{
		Version:      "1.0",
		ExportedAt:   time.Now(),
		Connections:  connections,
		Groups:       groups,
		PortForwards: pfConfigs,
	}

	return json.MarshalIndent(exportData, "", "  ")
}
