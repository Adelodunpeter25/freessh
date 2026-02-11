package workspace

type Snapshot struct {
	Workspaces map[WorkspaceID]Workspace
	TabOwners  map[TabID]TabRef
	WindowMode map[WindowID]WindowMode
}

func (m *Manager) Snapshot() Snapshot {
	m.mu.RLock()
	defer m.mu.RUnlock()

	workspaces := make(map[WorkspaceID]Workspace, len(m.workspaces))
	for id, ws := range m.workspaces {
		workspaces[id] = ws
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
		Workspaces: workspaces,
		TabOwners:  tabs,
		WindowMode: windowMode,
	}
}
