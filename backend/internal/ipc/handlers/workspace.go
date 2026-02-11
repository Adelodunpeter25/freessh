package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/workspace"
)

type WorkspaceHandler struct {
	manager *workspace.Manager
}

func NewWorkspaceHandler(manager *workspace.Manager) *WorkspaceHandler {
	return &WorkspaceHandler{manager: manager}
}

func (h *WorkspaceHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgWorkspaceRegisterWindow,
		models.MsgWorkspaceRemoveWindow,
		models.MsgWorkspaceCreate,
		models.MsgWorkspaceGetByWindow,
		models.MsgWorkspaceRegisterTab,
		models.MsgWorkspaceRemoveTab,
		models.MsgWorkspaceListTabs,
		models.MsgWorkspaceMoveTab:
		return true
	}
	return false
}

func (h *WorkspaceHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgWorkspaceRegisterWindow:
		return h.handleRegisterWindow(msg, writer)
	case models.MsgWorkspaceRemoveWindow:
		return h.handleRemoveWindow(msg, writer)
	case models.MsgWorkspaceCreate:
		return h.handleCreateWorkspace(msg, writer)
	case models.MsgWorkspaceGetByWindow:
		return h.handleGetByWindow(msg, writer)
	case models.MsgWorkspaceRegisterTab:
		return h.handleRegisterTab(msg, writer)
	case models.MsgWorkspaceRemoveTab:
		return h.handleRemoveTab(msg, writer)
	case models.MsgWorkspaceListTabs:
		return h.handleListTabs(msg, writer)
	case models.MsgWorkspaceMoveTab:
		return h.handleMoveTab(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func parseRequest(data interface{}, target interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}
	if err := json.Unmarshal(jsonData, target); err != nil {
		return fmt.Errorf("failed to parse request: %w", err)
	}
	return nil
}

func (h *WorkspaceHandler) handleRegisterWindow(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceRegisterWindowRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	h.manager.RegisterWindow(workspace.WindowID(req.WindowID), workspace.WindowMode(req.Mode))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceRegisterWindow,
		Data: models.WorkspaceRegisterWindowResponse{Status: "registered"},
	})
}

func (h *WorkspaceHandler) handleRemoveWindow(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceRemoveWindowRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	h.manager.RemoveWindow(workspace.WindowID(req.WindowID))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceRemoveWindow,
		Data: models.WorkspaceRemoveWindowResponse{Status: "removed"},
	})
}

func (h *WorkspaceHandler) handleCreateWorkspace(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceCreateRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	ws, err := h.manager.CreateWorkspace(workspace.WindowID(req.WindowID), req.Name)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceCreate,
		Data: models.WorkspaceCreateResponse{Workspace: toWorkspaceModel(ws)},
	})
}

func (h *WorkspaceHandler) handleGetByWindow(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceGetByWindowRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	ws, err := h.manager.GetWorkspaceByWindow(workspace.WindowID(req.WindowID))
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceGetByWindow,
		Data: models.WorkspaceGetByWindowResponse{Workspace: toWorkspaceModel(ws)},
	})
}

func (h *WorkspaceHandler) handleRegisterTab(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceRegisterTabRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	err := h.manager.RegisterTab(workspace.TabRef{
		TabID:     workspace.TabID(req.TabID),
		SessionID: workspace.SessionID(req.SessionID),
		WindowID:  workspace.WindowID(req.WindowID),
		IsLocal:   req.IsLocal,
	})
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceRegisterTab,
		Data: models.WorkspaceRegisterTabResponse{Status: "registered"},
	})
}

func (h *WorkspaceHandler) handleRemoveTab(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceRemoveTabRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	h.manager.RemoveTab(workspace.TabID(req.TabID))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceRemoveTab,
		Data: models.WorkspaceRemoveTabResponse{Status: "removed"},
	})
}

func (h *WorkspaceHandler) handleListTabs(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceListTabsRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	tabs := h.manager.ListTabs(workspace.WindowID(req.WindowID))
	results := make([]models.WorkspaceTabModel, 0, len(tabs))
	for _, tab := range tabs {
		results = append(results, toWorkspaceTabModel(tab))
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceListTabs,
		Data: models.WorkspaceListTabsResponse{Tabs: results},
	})
}

func (h *WorkspaceHandler) handleMoveTab(msg *models.IPCMessage, writer ResponseWriter) error {
	var req models.WorkspaceMoveTabRequest
	if err := parseRequest(msg.Data, &req); err != nil {
		return err
	}

	result, err := h.manager.MoveTab(workspace.TransferRequest{
		TabID:         workspace.TabID(req.TabID),
		SourceWindow:  workspace.WindowID(req.SourceWindow),
		TargetWindow:  workspace.WindowID(req.TargetWindow),
		TransactionID: req.TransactionID,
	})
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgWorkspaceMoveTab,
		Data: models.WorkspaceMoveTabResponse{
			TransactionID: result.TransactionID,
			TabID:         string(result.TabID),
			SourceWindow:  string(result.SourceWindow),
			TargetWindow:  string(result.TargetWindow),
			CompletedAt:   result.CompletedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		},
	})
}

func toWorkspaceModel(ws workspace.Workspace) models.WorkspaceModel {
	return models.WorkspaceModel{
		ID:        string(ws.ID),
		WindowID:  string(ws.WindowID),
		Name:      ws.Name,
		CreatedAt: ws.CreatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		UpdatedAt: ws.UpdatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
	}
}

func toWorkspaceTabModel(tab workspace.TabRef) models.WorkspaceTabModel {
	return models.WorkspaceTabModel{
		TabID:      string(tab.TabID),
		SessionID:  string(tab.SessionID),
		WindowID:   string(tab.WindowID),
		IsLocal:    tab.IsLocal,
		CreatedAt:  tab.CreatedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
		ModifiedAt: tab.ModifiedAt.UTC().Format("2006-01-02T15:04:05.000000000Z07:00"),
	}
}
