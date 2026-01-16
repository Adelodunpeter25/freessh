package storage

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"

	"github.com/google/uuid"
)

type ConnectionStorage struct {
	manager     *Manager
	connections map[string]models.ConnectionConfig
	mu          sync.RWMutex
}

func NewConnectionStorage() (*ConnectionStorage, error) {
	manager, err := NewManager("connections.json")
	if err != nil {
		return nil, err
	}

	storage := &ConnectionStorage{
		manager:     manager,
		connections: make(map[string]models.ConnectionConfig),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *ConnectionStorage) load() error {
	var connections []models.ConnectionConfig
	if err := s.manager.Load(&connections); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, conn := range connections {
		s.connections[conn.ID] = conn
	}

	return nil
}

func (s *ConnectionStorage) save() error {
	// Assumes caller already holds lock
	connections := make([]models.ConnectionConfig, 0, len(s.connections))
	for _, conn := range s.connections {
		connections = append(connections, conn)
	}

	return s.manager.Save(connections)
}

func (s *ConnectionStorage) saveWithLock() error {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.save()
}

func (s *ConnectionStorage) Save(config models.ConnectionConfig) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if config.ID == "" {
		config.ID = uuid.New().String()
	}

	s.connections[config.ID] = config

	return s.save()
}

func (s *ConnectionStorage) Get(id string) (*models.ConnectionConfig, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	conn, exists := s.connections[id]
	if !exists {
		return nil, fmt.Errorf("connection not found: %s", id)
	}

	return &conn, nil
}

func (s *ConnectionStorage) List() []models.ConnectionConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	connections := make([]models.ConnectionConfig, 0, len(s.connections))
	for _, conn := range s.connections {
		connections = append(connections, conn)
	}

	return connections
}

func (s *ConnectionStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.connections[id]; !exists {
		return fmt.Errorf("connection not found: %s", id)
	}

	delete(s.connections, id)

	return s.save()
}

func (s *ConnectionStorage) Update(config models.ConnectionConfig) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if config.ID == "" {
		return fmt.Errorf("connection ID is required")
	}

	if _, exists := s.connections[config.ID]; !exists {
		return fmt.Errorf("connection not found: %s", config.ID)
	}

	s.connections[config.ID] = config

	return s.save()
}
