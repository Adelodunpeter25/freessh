package workspace

import (
	"fmt"
	"freessh-backend/internal/storage"
	"sync"
)

const defaultStateFilename = "workspace_state.json"

type StateStore struct {
	manager *storage.Manager
	mu      sync.Mutex
}

func NewStateStore() (*StateStore, error) {
	return NewStateStoreWithFilename(defaultStateFilename)
}

func NewStateStoreWithFilename(filename string) (*StateStore, error) {
	manager, err := storage.NewManager(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize workspace state store: %w", err)
	}

	return &StateStore{
		manager: manager,
	}, nil
}

func (s *StateStore) Load() (PersistedState, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	state := PersistedState{}
	if err := s.manager.Load(&state); err != nil {
		return PersistedState{}, err
	}

	// Empty file / first launch.
	if state.Version == 0 {
		return PersistedState{}, ErrStateNotFound
	}

	return state, nil
}

func (s *StateStore) Save(state PersistedState) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.manager.Save(state)
}

func (s *StateStore) Clear() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.manager.Delete()
}

func (s *StateStore) Exists() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.manager.Exists()
}
