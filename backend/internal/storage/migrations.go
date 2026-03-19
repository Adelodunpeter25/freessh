package storage

import "sync"

const migrationsFilename = "sqlite_migrations.json"

type MigrationTracker struct {
	manager *Manager
	done    map[string]bool
	mu      sync.Mutex
}

func NewMigrationTracker() (*MigrationTracker, error) {
	manager, err := NewManager(migrationsFilename)
	if err != nil {
		return nil, err
	}

	tracker := &MigrationTracker{
		manager: manager,
		done:    make(map[string]bool),
	}

	if err := manager.Load(&tracker.done); err != nil {
		return nil, err
	}

	return tracker, nil
}

func (m *MigrationTracker) IsDone(name string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.done[name]
}

func (m *MigrationTracker) MarkDone(name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.done[name] {
		return nil
	}
	m.done[name] = true
	return m.manager.Save(m.done)
}
