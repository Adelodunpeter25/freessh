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

type ExportData struct {
	Version      string                     `json:"version"`
	ExportedAt   time.Time                  `json:"exported_at"`
	Connections  []models.ConnectionConfig  `json:"connections"`
	Groups       []models.Group             `json:"groups"`
	PortForwards []models.PortForwardConfig `json:"port_forwards"`
	Snippets     []models.Snippet           `json:"snippets,omitempty"`
	KnownHosts   []models.KnownHost         `json:"known_hosts,omitempty"`
	Keys         []ExportedKey              `json:"keys,omitempty"`
}

type ExportedKey struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Algorithm  string `json:"algorithm"`
	Bits       int    `json:"bits,omitempty"`
	PublicKey  string `json:"public_key"`
	PrivateKey string `json:"private_key"`
}

func (m *Manager) Export(format string) ([]byte, error) {
	switch format {
	case "freessh":
		return m.exportFreeSSH()
	case "openssh":
		return m.exportOpenSSH()
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
	snippets := make([]models.Snippet, 0)
	if m.snippetStorage != nil {
		snippets = m.snippetStorage.List()
	}
	knownHosts := make([]models.KnownHost, 0)
	if m.knownHostStorage != nil {
		for _, host := range m.knownHostStorage.GetAll() {
			if host == nil {
				continue
			}
			knownHosts = append(knownHosts, *host)
		}
	}

	// Convert pointer slice to value slice
	pfConfigs := make([]models.PortForwardConfig, len(portForwards))
	for i, pf := range portForwards {
		pfConfigs[i] = *pf
	}

	// Collect all key IDs referenced by connections
	keyIDs := make(map[string]bool)
	for _, conn := range connections {
		if conn.KeyID != "" {
			keyIDs[conn.KeyID] = true
		}
	}

	// Export keys that are referenced by connections
	var exportedKeys []ExportedKey
	if m.keyStorage != nil && m.keyFileStorage != nil {
		for keyID := range keyIDs {
			key, err := m.keyStorage.Get(keyID)
			if err != nil {
				continue // Skip if key not found
			}

			privateKey, err := m.keyFileStorage.GetPrivateKey(keyID)
			if err != nil {
				continue // Skip if private key not found
			}

			exportedKeys = append(exportedKeys, ExportedKey{
				ID:         key.ID,
				Name:       key.Name,
				Algorithm:  key.Algorithm,
				Bits:       key.Bits,
				PublicKey:  key.PublicKey,
				PrivateKey: privateKey,
			})
		}
	}

	exportData := ExportData{
		Version:      "1.0",
		ExportedAt:   time.Now(),
		Connections:  connections,
		Groups:       groups,
		PortForwards: pfConfigs,
		Snippets:     snippets,
		KnownHosts:   knownHosts,
		Keys:         exportedKeys,
	}

	return json.MarshalIndent(exportData, "", "  ")
}

func (m *Manager) exportOpenSSH() ([]byte, error) {
	connections := m.connectionStorage.List()
	return ExportOpenSSH(connections, m.keyFileStorage)
}
