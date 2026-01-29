package settings

import (
	"freessh-backend/internal/storage"
	"sync"
)

type LogSettings struct {
	AutoLogging bool `json:"auto_logging"`
}

type LogSettingsStorage struct {
	manager  *storage.Manager
	settings LogSettings
	mu       sync.RWMutex
}

func NewLogSettingsStorage() (*LogSettingsStorage, error) {
	manager, err := storage.NewManager("log_settings.json")
	if err != nil {
		return nil, err
	}

	storage := &LogSettingsStorage{
		manager: manager,
		settings: LogSettings{
			AutoLogging: false,
		},
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *LogSettingsStorage) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := s.manager.Load(&s.settings); err != nil {
		return err
	}

	return nil
}

func (s *LogSettingsStorage) Get() LogSettings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings
}

func (s *LogSettingsStorage) Update(settings LogSettings) error {
	s.mu.Lock()
	s.settings = settings
	s.mu.Unlock()

	return s.manager.Save(settings)
}

func (s *LogSettingsStorage) GetAutoLogging() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings.AutoLogging
}

func (s *LogSettingsStorage) SetAutoLogging(enabled bool) error {
	s.mu.Lock()
	s.settings.AutoLogging = enabled
	settings := s.settings
	s.mu.Unlock()

	return s.manager.Save(settings)
}
