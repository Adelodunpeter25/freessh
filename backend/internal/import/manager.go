package importpkg

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"os"
)

type Manager struct {
	connectionStorage *storage.ConnectionStorage
	groupStorage      *storage.GroupStorage
	pfStorage         *storage.PortForwardStorage
	keyStorage        *storage.KeyStorage
	keyFileStorage    *storage.KeyFileStorage
}

func NewManager(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage, keyStorage *storage.KeyStorage, keyFileStorage *storage.KeyFileStorage) *Manager {
	return &Manager{
		connectionStorage: connStorage,
		groupStorage:      groupStorage,
		pfStorage:         pfStorage,
		keyStorage:        keyStorage,
		keyFileStorage:    keyFileStorage,
	}
}

type ImportResult struct {
	ConnectionsImported  int      `json:"connections_imported"`
	GroupsImported       int      `json:"groups_imported"`
	PortForwardsImported int      `json:"port_forwards_imported"`
	KeysImported         int      `json:"keys_imported"`
	Errors               []string `json:"errors,omitempty"`
}

func (m *Manager) Import(format string, data []byte) (*ImportResult, error) {
	switch format {
	case "freessh":
		return m.importFreeSSH(data)
	case "openssh":
		return m.importOpenSSH(data)
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
		Keys         []struct {
			ID         string `json:"id"`
			Name       string `json:"name"`
			Algorithm  string `json:"algorithm"`
			Bits       int    `json:"bits,omitempty"`
			PublicKey  string `json:"public_key"`
			PrivateKey string `json:"private_key"`
		} `json:"keys,omitempty"`
	}

	if err := json.Unmarshal(data, &importData); err != nil {
		return nil, fmt.Errorf("failed to parse import data: %w", err)
	}

	result := &ImportResult{}

	// Import keys first (so connections can reference them)
	if m.keyStorage != nil && m.keyFileStorage != nil {
		for _, key := range importData.Keys {
			// Check if key already exists
			existingKey, _ := m.keyStorage.Get(key.ID)
			if existingKey != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Key %s already exists, skipping", key.Name))
				continue
			}

			// Save private key to file
			if err := m.keyFileStorage.SavePrivateKey(key.ID, key.PrivateKey); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to save private key for %s: %v", key.Name, err))
				continue
			}

			// Save key metadata
			sshKey := models.SSHKey{
				ID:        key.ID,
				Name:      key.Name,
				Algorithm: key.Algorithm,
				Bits:      key.Bits,
				PublicKey: key.PublicKey,
			}
			if err := m.keyStorage.Save(sshKey); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to import key %s: %v", key.Name, err))
				_ = m.keyFileStorage.DeletePrivateKey(key.ID) // Cleanup
			} else {
				result.KeysImported++
			}
		}
	}

	// Import groups
	for _, group := range importData.Groups {
		if err := m.groupStorage.Create(group); err != nil {
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

func (m *Manager) importOpenSSH(data []byte) (*ImportResult, error) {
	hosts, err := ParseOpenSSHConfig(data)
	if err != nil {
		return nil, err
	}

	result := &ImportResult{}

	for _, host := range hosts {
		conn := ConvertOpenSSHToConnection(host)
		
		// Check if connection already exists by name
		existing := m.connectionStorage.List()
		exists := false
		for _, e := range existing {
			if e.Name == conn.Name {
				exists = true
				break
			}
		}
		
		if exists {
			result.Errors = append(result.Errors, fmt.Sprintf("Connection %s already exists, skipping", conn.Name))
			continue
		}

		if err := m.connectionStorage.Save(conn); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import connection %s: %v", conn.Name, err))
		} else {
			result.ConnectionsImported++
		}
	}

	return result, nil
}
