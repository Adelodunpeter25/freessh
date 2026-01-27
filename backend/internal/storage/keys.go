package storage

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"
)

type KeyStorage struct {
	manager *Manager
	keys    map[string]models.SSHKey
	mu      sync.RWMutex
}

func NewKeyStorage() (*KeyStorage, error) {
	manager, err := NewManager("keys.json")
	if err != nil {
		return nil, err
	}

	storage := &KeyStorage{
		manager: manager,
		keys:    make(map[string]models.SSHKey),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *KeyStorage) load() error {
	var keys []models.SSHKey
	if err := s.manager.Load(&keys); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, key := range keys {
		s.keys[key.ID] = key
	}

	return nil
}

func (s *KeyStorage) save() error {
	keys := make([]models.SSHKey, 0, len(s.keys))
	for _, key := range s.keys {
		keys = append(keys, key)
	}
	return s.manager.Save(keys)
}

func (s *KeyStorage) Save(key models.SSHKey) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.keys[key.ID] = key
	return s.save()
}

func (s *KeyStorage) Get(id string) (*models.SSHKey, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	key, exists := s.keys[id]
	if !exists {
		return nil, fmt.Errorf("key not found: %s", id)
	}

	return &key, nil
}

func (s *KeyStorage) List() []models.SSHKey {
	s.mu.RLock()
	defer s.mu.RUnlock()

	keys := make([]models.SSHKey, 0, len(s.keys))
	for _, key := range s.keys {
		keys = append(keys, key)
	}

	return keys
}

func (s *KeyStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.keys[id]; !exists {
		return fmt.Errorf("key not found: %s", id)
	}

	delete(s.keys, id)
	return s.save()
}

func (s *KeyStorage) Update(key models.SSHKey) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.keys[key.ID]; !exists {
		return fmt.Errorf("key not found: %s", key.ID)
	}

	s.keys[key.ID] = key
	return s.save()
}
