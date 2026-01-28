package storage

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"os"
	"path/filepath"
	"sync"
)

type PortForwardStorage struct {
	configs map[string]*models.PortForwardConfig
	mu      sync.RWMutex
	path    string
}

func NewPortForwardStorage() (*PortForwardStorage, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	configDir := filepath.Join(homeDir, ".freessh")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	path := filepath.Join(configDir, "port_forwards.json")
	storage := &PortForwardStorage{
		configs: make(map[string]*models.PortForwardConfig),
		path:    path,
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *PortForwardStorage) load() error {
	data, err := os.ReadFile(s.path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to read port forwards file: %w", err)
	}

	var configs []*models.PortForwardConfig
	if err := json.Unmarshal(data, &configs); err != nil {
		return fmt.Errorf("failed to parse port forwards: %w", err)
	}

	for _, config := range configs {
		s.configs[config.ID] = config
	}

	return nil
}

func (s *PortForwardStorage) save() error {
	s.mu.RLock()
	configs := make([]*models.PortForwardConfig, 0, len(s.configs))
	for _, config := range s.configs {
		configs = append(configs, config)
	}
	s.mu.RUnlock()

	data, err := json.MarshalIndent(configs, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal port forwards: %w", err)
	}

	if err := os.WriteFile(s.path, data, 0644); err != nil {
		return fmt.Errorf("failed to write port forwards file: %w", err)
	}

	return nil
}

func (s *PortForwardStorage) GetAll() []*models.PortForwardConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	configs := make([]*models.PortForwardConfig, 0, len(s.configs))
	for _, config := range s.configs {
		configs = append(configs, config)
	}

	return configs
}

func (s *PortForwardStorage) Get(id string) *models.PortForwardConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.configs[id]
}

func (s *PortForwardStorage) GetByConnection(connectionID string) []*models.PortForwardConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	configs := make([]*models.PortForwardConfig, 0)
	for _, config := range s.configs {
		if config.ConnectionID == connectionID {
			configs = append(configs, config)
		}
	}

	return configs
}

func (s *PortForwardStorage) Add(config *models.PortForwardConfig) error {
	s.mu.Lock()
	s.configs[config.ID] = config
	s.mu.Unlock()

	return s.save()
}

func (s *PortForwardStorage) Update(config *models.PortForwardConfig) error {
	s.mu.Lock()
	if _, exists := s.configs[config.ID]; !exists {
		s.mu.Unlock()
		return fmt.Errorf("port forward config not found")
	}
	s.configs[config.ID] = config
	s.mu.Unlock()

	return s.save()
}

func (s *PortForwardStorage) Delete(id string) error {
	s.mu.Lock()
	delete(s.configs, id)
	s.mu.Unlock()

	return s.save()
}
