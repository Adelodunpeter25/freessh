package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/snippets"
	"freessh-backend/internal/storage"
)

type SnippetHandler struct {
	manager *snippets.Manager
}

func NewSnippetHandler(snippetStorage *storage.SnippetStorage) *SnippetHandler {
	return &SnippetHandler{
		manager: snippets.NewManager(snippetStorage),
	}
}

func (h *SnippetHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgSnippetList, models.MsgSnippetCreate, models.MsgSnippetUpdate, models.MsgSnippetDelete:
		return true
	}
	return false
}

func (h *SnippetHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgSnippetList:
		return h.handleList(writer)
	case models.MsgSnippetCreate:
		return h.handleCreate(msg, writer)
	case models.MsgSnippetUpdate:
		return h.handleUpdate(msg, writer)
	case models.MsgSnippetDelete:
		return h.handleDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *SnippetHandler) handleList(writer ResponseWriter) error {
	snippets, err := h.manager.List()
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSnippetList,
		Data: models.SnippetListResponse{
			Snippets: snippets,
		},
	})
}

func (h *SnippetHandler) handleCreate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.SnippetCreateRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse request: %w", err)
	}

	snippet, err := h.manager.Create(req.Name, req.Command)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSnippetCreate,
		Data: models.SnippetCreateResponse{
			Snippet: *snippet,
		},
	})
}

func (h *SnippetHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.SnippetUpdateRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse request: %w", err)
	}

	snippet, err := h.manager.Update(req.ID, req.Name, req.Command)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSnippetUpdate,
		Data: models.SnippetUpdateResponse{
			Snippet: *snippet,
		},
	})
}

func (h *SnippetHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, ok := dataMap["id"].(string)
	if !ok {
		return fmt.Errorf("snippet id required")
	}

	if err := h.manager.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSnippetDelete,
		Data: models.SnippetDeleteResponse{
			Status: "deleted",
		},
	})
}
