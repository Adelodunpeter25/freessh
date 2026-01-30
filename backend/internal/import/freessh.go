package importpkg

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"time"
)

type FreeSSHImportData struct {
	Version      string                       `json:"version"`
	ExportedAt   time.Time                    `json:"exported_at"`
	Connections  []models.ConnectionConfig    `json:"connections"`
	Groups       []models.Group               `json:"groups"`
	PortForwards []models.PortForwardConfig   `json:"port_forwards"`
}

func ImportFreeSSH(data []byte) (*FreeSSHImportData, error) {
	var importData FreeSSHImportData

	if err := json.Unmarshal(data, &importData); err != nil {
		return nil, fmt.Errorf("failed to parse FreeSSH import data: %w", err)
	}

	if importData.Version == "" {
		return nil, fmt.Errorf("invalid FreeSSH export file: missing version")
	}

	return &importData, nil
}
