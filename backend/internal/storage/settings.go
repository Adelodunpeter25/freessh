package storage

import (
	"sync"
)

type Settings struct {
	AutoLogging bool `json:"auto_logging"`
}

type SettingsStorage struct {
	manager  *Manager
	settings Settings
	mu       sync.RWMutex
}

func NewSettingsStorage() (*SettingsStorage, error) {
	manager, err := NewManager("settings.json")
	if err != nil {
		return nil, err
	}

	storage := &SettingsStorage{
		manager: manager,
		settings: Settings{
			AutoLogging: false,
		},
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *SettingsStorage) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := s.manager.Load(&s.settings); err != nil {
		return err
	}

	return nil
}

func (s *SettingsStorage) Get() Settings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings
}

func (s *SettingsStorage) Update(settings Settings) error {
	s.mu.Lock()
	s.settings = settings
	s.mu.Unlock()

	return s.manager.Save(settings)
}

func (s *SettingsStorage) GetAutoLogging() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings.AutoLogging
}

func (s *SettingsStorage) SetAutoLogging(enabled bool) error {
	s.mu.Lock()
	s.settings.AutoLogging = enabled
	settings := s.settings
	s.mu.Unlock()

	return s.manager.Save(settings)
}
