package storage

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"
)

type GroupStorage struct {
	manager *Manager
	groups  map[string]models.Group
	mu      sync.RWMutex
}

func NewGroupStorage() (*GroupStorage, error) {
	manager, err := NewManager("groups.json")
	if err != nil {
		return nil, err
	}

	storage := &GroupStorage{
		manager: manager,
		groups:  make(map[string]models.Group),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *GroupStorage) load() error {
	var groups []models.Group
	if err := s.manager.Load(&groups); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, group := range groups {
		s.groups[group.ID] = group
	}

	return nil
}

func (s *GroupStorage) save() error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	groups := make([]models.Group, 0, len(s.groups))
	for _, group := range s.groups {
		groups = append(groups, group)
	}

	return s.manager.Save(groups)
}

func (s *GroupStorage) Create(group models.Group) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.groups[group.ID]; exists {
		return fmt.Errorf("group already exists: %s", group.ID)
	}

	s.groups[group.ID] = group
	return s.save()
}

func (s *GroupStorage) Get(id string) (*models.Group, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	group, exists := s.groups[id]
	if !exists {
		return nil, fmt.Errorf("group not found: %s", id)
	}

	return &group, nil
}

func (s *GroupStorage) GetByName(name string) (*models.Group, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, group := range s.groups {
		if group.Name == name {
			return &group, nil
		}
	}

	return nil, fmt.Errorf("group not found: %s", name)
}

func (s *GroupStorage) List() []models.Group {
	s.mu.RLock()
	defer s.mu.RUnlock()

	groups := make([]models.Group, 0, len(s.groups))
	for _, group := range s.groups {
		groups = append(groups, group)
	}

	return groups
}

func (s *GroupStorage) Update(group models.Group) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.groups[group.ID]; !exists {
		return fmt.Errorf("group not found: %s", group.ID)
	}

	s.groups[group.ID] = group
	return s.save()
}

func (s *GroupStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.groups[id]; !exists {
		return fmt.Errorf("group not found: %s", id)
	}

	delete(s.groups, id)
	return s.save()
}
