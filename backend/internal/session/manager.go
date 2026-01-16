package session

import (
	"fmt"
	"freessh-backend/internal/storage"
	"sync"
)

type Manager struct {
	sessions  map[string]*ActiveSession
	storage   *storage.ConnectionStorage
	mu        sync.RWMutex
}

func NewManager() *Manager {
	storage, err := storage.NewConnectionStorage()
	if err != nil {
		// Log error but don't fail - storage is optional
		storage = nil
	}

	return &Manager{
		sessions: make(map[string]*ActiveSession),
		storage:  storage,
	}
}

func (m *Manager) AddSession(session *ActiveSession) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessions[session.ID] = session
}

func (m *Manager) GetSession(sessionID string) (*ActiveSession, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	session, exists := m.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}

	return session, nil
}

func (m *Manager) RemoveSession(sessionID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.sessions, sessionID)
}

func (m *Manager) GetAllSessions() []*ActiveSession {
	m.mu.RLock()
	defer m.mu.RUnlock()

	sessions := make([]*ActiveSession, 0, len(m.sessions))
	for _, session := range m.sessions {
		sessions = append(sessions, session)
	}

	return sessions
}

func (m *Manager) GetStorage() *storage.ConnectionStorage {
	return m.storage
}
