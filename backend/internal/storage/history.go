package storage

import (
	"freessh-backend/internal/models"
	"sync"
)

type HistoryStorage struct {
	manager *Manager
	entries []models.HistoryEntry
	mu      sync.RWMutex
}

func NewHistoryStorage() (*HistoryStorage, error) {
	manager, err := NewManager("history.json")
	if err != nil {
		return nil, err
	}

	storage := &HistoryStorage{
		manager: manager,
		entries: make([]models.HistoryEntry, 0),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *HistoryStorage) load() error {
	var entries []models.HistoryEntry
	if err := s.manager.Load(&entries); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.entries = entries
	return nil
}

func (s *HistoryStorage) save() error {
	s.mu.RLock()
	entries := append([]models.HistoryEntry(nil), s.entries...)
	s.mu.RUnlock()
	return s.manager.Save(entries)
}

func (s *HistoryStorage) saveSnapshot(entries []models.HistoryEntry) error {
	return s.manager.Save(entries)
}

func (s *HistoryStorage) List() []models.HistoryEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return copy in reverse order (most recent first)
	result := make([]models.HistoryEntry, len(s.entries))
	for i, entry := range s.entries {
		result[len(s.entries)-1-i] = entry
	}

	return result
}

func (s *HistoryStorage) Add(entry models.HistoryEntry) error {
	s.mu.Lock()
	s.entries = append(s.entries, entry)

	// Keep only last 200 entries
	if len(s.entries) > 200 {
		s.entries = s.entries[len(s.entries)-200:]
	}
	snapshot := append([]models.HistoryEntry(nil), s.entries...)
	s.mu.Unlock()

	// Save asynchronously to avoid blocking terminal input
	go s.saveSnapshot(snapshot)

	return nil
}

func (s *HistoryStorage) Clear() error {
	s.mu.Lock()
	s.entries = make([]models.HistoryEntry, 0)
	snapshot := append([]models.HistoryEntry(nil), s.entries...)
	s.mu.Unlock()
	return s.saveSnapshot(snapshot)
}

func (s *HistoryStorage) GetRecent(limit int) []models.HistoryEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > len(s.entries) {
		limit = len(s.entries)
	}

	// Return last N entries in reverse order (most recent first)
	result := make([]models.HistoryEntry, limit)
	start := len(s.entries) - limit
	for i := 0; i < limit; i++ {
		result[i] = s.entries[start+limit-1-i]
	}

	return result
}
