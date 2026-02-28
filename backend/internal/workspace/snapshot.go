package workspace

type Snapshot struct {
	Workspaces    map[WorkspaceID]Workspace
	WindowToSpace map[WindowID]WorkspaceID
	TabOwners     map[TabID]TabRef
	WindowMode    map[WindowID]WindowMode
}

func (m *Manager) Snapshot() Snapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.snapshotLocked()
}

func (m *Manager) snapshotLocked() Snapshot {
	workspaces := make(map[WorkspaceID]Workspace, len(m.workspaces))
	for id, ws := range m.workspaces {
		workspaces[id] = ws
	}

	windowToSpace := make(map[WindowID]WorkspaceID, len(m.windowToSpace))
	for id, wsID := range m.windowToSpace {
		windowToSpace[id] = wsID
	}

	tabs := make(map[TabID]TabRef, len(m.tabOwners))
	for id, ref := range m.tabOwners {
		tabs[id] = ref
	}

	windowMode := make(map[WindowID]WindowMode, len(m.windowMode))
	for id, mode := range m.windowMode {
		windowMode[id] = mode
	}

	return Snapshot{
		Workspaces:    workspaces,
		WindowToSpace: windowToSpace,
		TabOwners:     tabs,
		WindowMode:    windowMode,
	}
}

func (m *Manager) Restore(snapshot Snapshot) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.workspaces = make(map[WorkspaceID]Workspace, len(snapshot.Workspaces))
	for id, ws := range snapshot.Workspaces {
		m.workspaces[id] = ws
	}

	m.windowToSpace = make(map[WindowID]WorkspaceID, len(snapshot.WindowToSpace))
	for id, wsID := range snapshot.WindowToSpace {
		m.windowToSpace[id] = wsID
	}

	m.tabOwners = make(map[TabID]TabRef, len(snapshot.TabOwners))
	for id, ref := range snapshot.TabOwners {
		m.tabOwners[id] = ref
	}

	m.windowMode = make(map[WindowID]WindowMode, len(snapshot.WindowMode))
	for id, mode := range snapshot.WindowMode {
		m.windowMode[id] = mode
	}
}
