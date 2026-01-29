package session

import (
	"fmt"
	"freessh-backend/internal/settings"
	"freessh-backend/internal/storage"
	"sync"
)

type Manager struct {
	sessions        map[string]*ActiveSession
	storage         *storage.ConnectionStorage
	logSettings     *settings.LogSettingsStorage
	mu              sync.RWMutex
}

func NewManager(logSettings *settings.LogSettingsStorage) *Manager {
	storage, err := storage.NewConnectionStorage()
	if err != nil {
		// Log error but don't fail - storage is optional
		storage = nil
	}

	return &Manager{
		sessions:    make(map[string]*ActiveSession),
		storage:     storage,
		logSettings: logSettings,
	}
}

func (m *Manager) GetConnectionStorage() *storage.ConnectionStorage {
	return m.storage
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

func (m *Manager) GetOrCreateSession(connectionID string) (*ActiveSession, error) {
	// Check if session already exists for this connection
	m.mu.RLock()
	for _, session := range m.sessions {
		if session.Session.ConnectionID == connectionID {
			m.mu.RUnlock()
			return session, nil
		}
	}
	m.mu.RUnlock()

	// Get connection config
	if m.storage == nil {
		return nil, fmt.Errorf("connection storage not available")
	}

	conn, err := m.storage.Get(connectionID)
	if err != nil {
		return nil, fmt.Errorf("connection not found: %w", err)
	}

	// Create new session
	sessionModel, err := m.CreateSession(*conn)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Get the active session
	activeSession, err := m.GetSession(sessionModel.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active session: %w", err)
	}

	return activeSession, nil
}
