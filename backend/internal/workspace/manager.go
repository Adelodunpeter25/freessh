package workspace

import (
	"fmt"
	"sync"
	"time"
)

type Manager struct {
	mu sync.RWMutex

	enabled bool

	workspaces    map[WorkspaceID]Workspace
	windowToSpace map[WindowID]WorkspaceID
	tabOwners     map[TabID]TabRef
	windowMode    map[WindowID]WindowMode
}

func NewManager(enabled bool) *Manager {
	return &Manager{
		enabled:       enabled,
		workspaces:    make(map[WorkspaceID]Workspace),
		windowToSpace: make(map[WindowID]WorkspaceID),
		tabOwners:     make(map[TabID]TabRef),
		windowMode:    make(map[WindowID]WindowMode),
	}
}

func (m *Manager) Enabled() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.enabled
}

func (m *Manager) SetEnabled(enabled bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.enabled = enabled
}

func (m *Manager) RegisterWindow(windowID WindowID, mode WindowMode) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.windowMode[windowID] = mode
}

func (m *Manager) RemoveWindow(windowID WindowID) {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.windowMode, windowID)

	if spaceID, ok := m.windowToSpace[windowID]; ok {
		delete(m.windowToSpace, windowID)
		delete(m.workspaces, spaceID)
	}

	for tabID, ref := range m.tabOwners {
		if ref.WindowID == windowID {
			delete(m.tabOwners, tabID)
		}
	}
}

func (m *Manager) CreateWorkspace(windowID WindowID, name string) (Workspace, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.enabled {
		return Workspace{}, ErrFeatureDisabled
	}

	now := time.Now().UTC()
	id := WorkspaceID(fmt.Sprintf("ws-%d", now.UnixNano()))

	ws := Workspace{
		ID:        id,
		WindowID:  windowID,
		Name:      name,
		CreatedAt: now,
		UpdatedAt: now,
	}

	m.workspaces[id] = ws
	m.windowToSpace[windowID] = id
	m.windowMode[windowID] = WindowModeWorkspace

	return ws, nil
}

func (m *Manager) GetWorkspaceByWindow(windowID WindowID) (Workspace, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	spaceID, ok := m.windowToSpace[windowID]
	if !ok {
		return Workspace{}, ErrWorkspaceNotFound
	}

	ws, ok := m.workspaces[spaceID]
	if !ok {
		return Workspace{}, ErrWorkspaceNotFound
	}

	return ws, nil
}

func (m *Manager) RegisterTab(ref TabRef) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.enabled {
		return ErrFeatureDisabled
	}

	if _, ok := m.windowMode[ref.WindowID]; !ok {
		return ErrWindowNotFound
	}

	now := time.Now().UTC()
	if ref.CreatedAt.IsZero() {
		ref.CreatedAt = now
	}
	ref.ModifiedAt = now

	m.tabOwners[ref.TabID] = ref
	return nil
}

func (m *Manager) RemoveTab(tabID TabID) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.tabOwners, tabID)
}

func (m *Manager) GetTab(tabID TabID) (TabRef, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	ref, ok := m.tabOwners[tabID]
	if !ok {
		return TabRef{}, ErrTabNotFound
	}

	return ref, nil
}

func (m *Manager) ListTabs(windowID WindowID) []TabRef {
	m.mu.RLock()
	defer m.mu.RUnlock()

	results := make([]TabRef, 0)
	for _, ref := range m.tabOwners {
		if ref.WindowID == windowID {
			results = append(results, ref)
		}
	}
	return results
}
