package storage

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"
)

type SnippetStorage struct {
	manager  *Manager
	snippets map[string]models.Snippet
	mu       sync.RWMutex
}

func NewSnippetStorage() (*SnippetStorage, error) {
	manager, err := NewManager("snippets.json")
	if err != nil {
		return nil, err
	}

	storage := &SnippetStorage{
		manager:  manager,
		snippets: make(map[string]models.Snippet),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *SnippetStorage) load() error {
	var snippets []models.Snippet
	if err := s.manager.Load(&snippets); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, snippet := range snippets {
		s.snippets[snippet.ID] = snippet
	}

	return nil
}

func (s *SnippetStorage) save() error {
	snippets := make([]models.Snippet, 0, len(s.snippets))
	for _, snippet := range s.snippets {
		snippets = append(snippets, snippet)
	}
	return s.manager.Save(snippets)
}

func (s *SnippetStorage) List() []models.Snippet {
	s.mu.RLock()
	defer s.mu.RUnlock()

	snippets := make([]models.Snippet, 0, len(s.snippets))
	for _, snippet := range s.snippets {
		snippets = append(snippets, snippet)
	}

	return snippets
}

func (s *SnippetStorage) Get(id string) (*models.Snippet, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	snippet, exists := s.snippets[id]
	if !exists {
		return nil, fmt.Errorf("snippet not found: %s", id)
	}

	return &snippet, nil
}

func (s *SnippetStorage) Create(snippet models.Snippet) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.snippets[snippet.ID]; exists {
		return fmt.Errorf("snippet already exists: %s", snippet.ID)
	}

	s.snippets[snippet.ID] = snippet
	return s.save()
}

func (s *SnippetStorage) Update(snippet models.Snippet) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.snippets[snippet.ID]; !exists {
		return fmt.Errorf("snippet not found: %s", snippet.ID)
	}

	s.snippets[snippet.ID] = snippet
	return s.save()
}

func (s *SnippetStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.snippets[id]; !exists {
		return fmt.Errorf("snippet not found: %s", id)
	}

	delete(s.snippets, id)
	return s.save()
}
