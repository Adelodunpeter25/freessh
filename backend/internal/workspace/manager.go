package workspace

import (
	"fmt"
	"sync"
	"time"
)

type Manager struct {
	mu sync.RWMutex

	enabled bool

	stateStore *StateStore

	workspaces    map[WorkspaceID]Workspace
	windowToSpace map[WindowID]WorkspaceID
	tabOwners     map[TabID]TabRef
	windowMode    map[WindowID]WindowMode
	clientState   map[string]interface{}
}

func NewManager(enabled bool) *Manager {
	return &Manager{
		enabled:       enabled,
		workspaces:    make(map[WorkspaceID]Workspace),
		windowToSpace: make(map[WindowID]WorkspaceID),
		tabOwners:     make(map[TabID]TabRef),
		windowMode:    make(map[WindowID]WindowMode),
		clientState:   make(map[string]interface{}),
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

func (m *Manager) SetStateStore(store *StateStore) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.stateStore = store
}

func (m *Manager) SavePersistedState(clientState map[string]interface{}) (PersistedState, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.stateStore == nil {
		return PersistedState{}, fmt.Errorf("workspace state store not configured")
	}

	if clientState != nil {
		m.clientState = cloneClientState(clientState)
	}

	state := PersistedState{
		Version:     StateVersion,
		SavedAt:     time.Now().UTC(),
		Snapshot:    m.snapshotLocked(),
		ClientState: cloneClientState(m.clientState),
	}

	if err := m.stateStore.Save(state); err != nil {
		return PersistedState{}, err
	}

	return state, nil
}

func (m *Manager) LoadPersistedState() (PersistedState, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.stateStore == nil {
		return PersistedState{}, fmt.Errorf("workspace state store not configured")
	}

	state, err := m.stateStore.Load()
	if err != nil {
		return PersistedState{}, err
	}

	m.workspaces = make(map[WorkspaceID]Workspace, len(state.Snapshot.Workspaces))
	for id, ws := range state.Snapshot.Workspaces {
		m.workspaces[id] = ws
	}

	m.windowToSpace = make(map[WindowID]WorkspaceID, len(state.Snapshot.WindowToSpace))
	for id, wsID := range state.Snapshot.WindowToSpace {
		m.windowToSpace[id] = wsID
	}

	m.tabOwners = make(map[TabID]TabRef, len(state.Snapshot.TabOwners))
	for id, ref := range state.Snapshot.TabOwners {
		m.tabOwners[id] = ref
	}

	m.windowMode = make(map[WindowID]WindowMode, len(state.Snapshot.WindowMode))
	for id, mode := range state.Snapshot.WindowMode {
		m.windowMode[id] = mode
	}

	m.clientState = cloneClientState(state.ClientState)

	return state, nil
}

func (m *Manager) ClearPersistedState() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.stateStore == nil {
		return fmt.Errorf("workspace state store not configured")
	}

	if err := m.stateStore.Clear(); err != nil {
		return err
	}

	m.clientState = make(map[string]interface{})
	return nil
}

func cloneClientState(state map[string]interface{}) map[string]interface{} {
	if len(state) == 0 {
		return map[string]interface{}{}
	}

	clone := make(map[string]interface{}, len(state))
	for k, v := range state {
		clone[k] = v
	}
	return clone
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
