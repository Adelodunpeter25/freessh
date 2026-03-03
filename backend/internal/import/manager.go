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
	snippetStorage    *storage.SnippetStorage
	knownHostStorage  *storage.KnownHostStorage
	keyStorage        *storage.KeyStorage
	keyFileStorage    *storage.KeyFileStorage
}

func NewManager(
	connStorage *storage.ConnectionStorage,
	groupStorage *storage.GroupStorage,
	pfStorage *storage.PortForwardStorage,
	snippetStorage *storage.SnippetStorage,
	knownHostStorage *storage.KnownHostStorage,
	keyStorage *storage.KeyStorage,
	keyFileStorage *storage.KeyFileStorage,
) *Manager {
	return &Manager{
		connectionStorage: connStorage,
		groupStorage:      groupStorage,
		pfStorage:         pfStorage,
		snippetStorage:    snippetStorage,
		knownHostStorage:  knownHostStorage,
		keyStorage:        keyStorage,
		keyFileStorage:    keyFileStorage,
	}
}

type ImportResult struct {
	ConnectionsImported  int      `json:"connections_imported"`
	GroupsImported       int      `json:"groups_imported"`
	PortForwardsImported int      `json:"port_forwards_imported"`
	KeysImported         int      `json:"keys_imported"`
	SnippetsImported     int      `json:"snippets_imported"`
	KnownHostsImported   int      `json:"known_hosts_imported"`
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
		Version      string                     `json:"version"`
		Connections  []models.ConnectionConfig  `json:"connections"`
		Groups       []models.Group             `json:"groups"`
		PortForwards []models.PortForwardConfig `json:"port_forwards"`
		Snippets     []models.Snippet           `json:"snippets,omitempty"`
		KnownHosts   []models.KnownHost         `json:"known_hosts,omitempty"`
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
	existingGroupsByName := make(map[string]struct{})
	for _, group := range m.groupStorage.List() {
		existingGroupsByName[group.Name] = struct{}{}
	}
	for _, group := range importData.Groups {
		if _, exists := existingGroupsByName[group.Name]; exists {
			result.Errors = append(result.Errors, fmt.Sprintf("Group %s already exists, skipping", group.Name))
			continue
		}
		if err := m.groupStorage.Create(group); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import group %s: %v", group.Name, err))
		} else {
			result.GroupsImported++
			existingGroupsByName[group.Name] = struct{}{}
		}
	}

	// Import connections
	existingConnectionsByID := make(map[string]struct{})
	existingConnectionsByAddress := make(map[string]struct{})
	for _, existing := range m.connectionStorage.List() {
		if existing.ID != "" {
			existingConnectionsByID[existing.ID] = struct{}{}
		}
		key := fmt.Sprintf("%s|%s|%d|%s", existing.Name, existing.Host, existing.Port, existing.Username)
		existingConnectionsByAddress[key] = struct{}{}
	}
	for _, conn := range importData.Connections {
		if conn.ID != "" {
			if _, exists := existingConnectionsByID[conn.ID]; exists {
				result.Errors = append(result.Errors, fmt.Sprintf("Connection %s already exists (same ID), skipping", conn.Name))
				continue
			}
		}
		key := fmt.Sprintf("%s|%s|%d|%s", conn.Name, conn.Host, conn.Port, conn.Username)
		if _, exists := existingConnectionsByAddress[key]; exists {
			result.Errors = append(result.Errors, fmt.Sprintf("Connection %s already exists (same host/user), skipping", conn.Name))
			continue
		}
		if err := m.connectionStorage.Save(conn); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import connection %s: %v", conn.Name, err))
		} else {
			result.ConnectionsImported++
			if conn.ID != "" {
				existingConnectionsByID[conn.ID] = struct{}{}
			}
			existingConnectionsByAddress[key] = struct{}{}
		}
	}

	// Import port forwards
	existingPortForwards := make(map[string]struct{})
	for _, existing := range m.pfStorage.GetAll() {
		if existing != nil && existing.ID != "" {
			existingPortForwards[existing.ID] = struct{}{}
		}
	}
	for _, pf := range importData.PortForwards {
		if pf.ID != "" {
			if _, exists := existingPortForwards[pf.ID]; exists {
				result.Errors = append(result.Errors, fmt.Sprintf("Port forward %s already exists, skipping", pf.Name))
				continue
			}
		}
		if err := m.pfStorage.Add(&pf); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("Failed to import port forward %s: %v", pf.Name, err))
		} else {
			result.PortForwardsImported++
			if pf.ID != "" {
				existingPortForwards[pf.ID] = struct{}{}
			}
		}
	}

	// Import snippets
	if m.snippetStorage != nil {
		existingSnippetsByNameCommand := make(map[string]struct{})
		for _, snippet := range m.snippetStorage.List() {
			existingSnippetsByNameCommand[fmt.Sprintf("%s|%s", snippet.Name, snippet.Command)] = struct{}{}
		}
		for _, snippet := range importData.Snippets {
			key := fmt.Sprintf("%s|%s", snippet.Name, snippet.Command)
			if _, exists := existingSnippetsByNameCommand[key]; exists {
				result.Errors = append(result.Errors, fmt.Sprintf("Snippet %s already exists, skipping", snippet.Name))
				continue
			}
			if err := m.snippetStorage.Create(snippet); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to import snippet %s: %v", snippet.Name, err))
			} else {
				result.SnippetsImported++
				existingSnippetsByNameCommand[key] = struct{}{}
			}
		}
	}

	// Import known hosts
	if m.knownHostStorage != nil {
		existingKnownHosts := make(map[string]string)
		for _, host := range m.knownHostStorage.GetAll() {
			if host == nil {
				continue
			}
			existingKnownHosts[fmt.Sprintf("%s|%d", host.Hostname, host.Port)] = host.Fingerprint
		}
		for _, host := range importData.KnownHosts {
			key := fmt.Sprintf("%s|%d", host.Hostname, host.Port)
			if existingFingerprint, exists := existingKnownHosts[key]; exists {
				if existingFingerprint == host.Fingerprint {
					result.Errors = append(result.Errors, fmt.Sprintf("Known host %s:%d already exists, skipping", host.Hostname, host.Port))
				} else {
					result.Errors = append(result.Errors, fmt.Sprintf("Known host %s:%d has different fingerprint locally, skipping", host.Hostname, host.Port))
				}
				continue
			}
			h := host
			if err := m.knownHostStorage.Add(&h); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to import known host %s:%d: %v", host.Hostname, host.Port, err))
			} else {
				result.KnownHostsImported++
				existingKnownHosts[key] = host.Fingerprint
			}
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
