package handlers

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/workspace"
)

type WorkspacePersistenceHandler struct {
	manager *workspace.Manager
}

func NewWorkspacePersistenceHandler(manager *workspace.Manager) *WorkspacePersistenceHandler {
	return &WorkspacePersistenceHandler{manager: manager}
}

func (h *WorkspacePersistenceHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgWorkspaceStateSave,
		models.MsgWorkspaceStateLoad,
		models.MsgWorkspaceStateClear:
		return true
	}
	return false
}

func (h *WorkspacePersistenceHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgWorkspaceStateSave:
		return h.handleSave(msg, writer)
	case models.MsgWorkspaceStateLoad:
		return h.handleLoad(msg, writer)
	case models.MsgWorkspaceStateClear:
		return h.handleClear(writer)
	default:
		return nil
	}
}

func (h *WorkspacePersistenceHandler) handleSave(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceStateSaveRequest
	if msg.Data != nil {
		if err := parseRequest(msg.Data, &req); err != nil {
			return err
		}
	}

	state, err := h.manager.SavePersistedState(req.ClientState)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceStateSave,
		Data: models.WorkspaceStateSaveResponse{
			Status: "saved",
			State:  toWorkspaceStateModel(state),
		},
	})
}

func (h *WorkspacePersistenceHandler) handleLoad(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceStateLoadRequest
	if msg.Data != nil {
		if err := parseRequest(msg.Data, &req); err != nil {
			return err
		}
	}

	state, err := h.manager.LoadPersistedState()
	if err != nil {
		if err == workspace.ErrStateNotFound {
			return writer.WriteMessage(&models.IPCMessage{
				Type: models.MsgWorkspaceStateLoad,
				Data: models.WorkspaceStateLoadResponse{
					Found: false,
				},
			})
		}
		return err
	}

	model := toWorkspaceStateModel(state)
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceStateLoad,
		Data: models.WorkspaceStateLoadResponse{
			Found: true,
			State: &model,
		},
	})
}

func (h *WorkspacePersistenceHandler) handleClear(writer ResponseWriter) error {
	if err := h.manager.ClearPersistedState(); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceStateClear,
		Data: models.WorkspaceStateClearResponse{
			Status: "cleared",
		},
	})
}

func toWorkspaceStateModel(state workspace.PersistedState) models.WorkspaceStateModel {
	workspaces := make(map[string]models.WorkspaceModel, len(state.Snapshot.Workspaces))
	for id, ws := range state.Snapshot.Workspaces {
		workspaces[string(id)] = models.WorkspaceModel{
			ID:        string(ws.ID),
			WindowID:  string(ws.WindowID),
			Name:      ws.Name,
			CreatedAt: ws.CreatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
			UpdatedAt: ws.UpdatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		}
	}

	windowToSpace := make(map[string]string, len(state.Snapshot.WindowToSpace))
	for windowID, wsID := range state.Snapshot.WindowToSpace {
		windowToSpace[string(windowID)] = string(wsID)
	}

	tabs := make(map[string]models.WorkspaceTabModel, len(state.Snapshot.TabOwners))
	for id, tab := range state.Snapshot.TabOwners {
		tabs[string(id)] = models.WorkspaceTabModel{
			TabID:      string(tab.TabID),
			SessionID:  string(tab.SessionID),
			WindowID:   string(tab.WindowID),
			IsLocal:    tab.IsLocal,
			CreatedAt:  tab.CreatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
			ModifiedAt: tab.ModifiedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		}
	}

	windowMode := make(map[string]string, len(state.Snapshot.WindowMode))
	for windowID, mode := range state.Snapshot.WindowMode {
		windowMode[string(windowID)] = string(mode)
	}

	return models.WorkspaceStateModel{
		Version: state.Version,
		SavedAt: state.SavedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		Snapshot: models.WorkspaceStateSnapshotModel{
			Workspaces:    workspaces,
			WindowToSpace: windowToSpace,
			Tabs:          tabs,
			WindowMode:    windowMode,
		},
		ClientState: state.ClientState,
	}
}
