package export

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"time"
)

func ExportFreeSSH(connections []models.ConnectionConfig, groups []models.Group, portForwards []models.PortForwardConfig) ([]byte, error) {
	exportData := ExportData{
		Version:      "1.0",
		ExportedAt:   time.Now(),
		Connections:  connections,
		Groups:       groups,
		PortForwards: portForwards,
	}

	data, err := json.MarshalIndent(exportData, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal export data: %w", err)
	}

	return data, nil
}
