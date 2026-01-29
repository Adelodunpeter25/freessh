package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/groups"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type GroupHandler struct {
	manager *groups.Manager
}

func NewGroupHandler(groupStorage *storage.GroupStorage, connectionStorage *storage.ConnectionStorage) *GroupHandler {
	return &GroupHandler{
		manager: groups.NewManager(groupStorage, connectionStorage),
	}
}

func (h *GroupHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgGroupList ||
		msgType == models.MsgGroupCreate ||
		msgType == models.MsgGroupRename ||
		msgType == models.MsgGroupDelete
}

func (h *GroupHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgGroupList:
		return h.handleList(writer)
	case models.MsgGroupCreate:
		return h.handleCreate(msg, writer)
	case models.MsgGroupRename:
		return h.handleRename(msg, writer)
	case models.MsgGroupDelete:
		return h.handleDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *GroupHandler) handleList(writer ResponseWriter) error {
	groups, err := h.manager.List()
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgGroupList,
		Data: map[string]interface{}{
			"groups": groups,
		},
	})
}

func (h *GroupHandler) handleCreate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid create data: %w", err)
	}

	var data struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return fmt.Errorf("failed to parse create data: %w", err)
	}

	group, err := h.manager.Create(data.Name)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgGroupCreate,
		Data: map[string]interface{}{
			"group": group,
		},
	})
}

func (h *GroupHandler) handleRename(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid rename data: %w", err)
	}

	var data struct {
		ID      string `json:"id"`
		NewName string `json:"new_name"`
	}
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return fmt.Errorf("failed to parse rename data: %w", err)
	}

	if err := h.manager.Rename(data.ID, data.NewName); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgGroupRename,
		Data: map[string]interface{}{
			"success": true,
		},
	})
}

func (h *GroupHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid delete data: %w", err)
	}

	var data struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return fmt.Errorf("failed to parse delete data: %w", err)
	}

	if err := h.manager.Delete(data.ID); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgGroupDelete,
		Data: map[string]interface{}{
			"success": true,
		},
	})
}
