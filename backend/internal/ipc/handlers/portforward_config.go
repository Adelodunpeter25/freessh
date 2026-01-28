package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"

	"github.com/google/uuid"
)

type PortForwardConfigHandler struct {
	storage *storage.PortForwardStorage
}

func NewPortForwardConfigHandler(storage *storage.PortForwardStorage) *PortForwardConfigHandler {
	return &PortForwardConfigHandler{
		storage: storage,
	}
}

func (h *PortForwardConfigHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgPortForwardConfigList, models.MsgPortForwardConfigGet, 
	     models.MsgPortForwardConfigCreate, models.MsgPortForwardConfigUpdate, 
	     models.MsgPortForwardConfigDelete:
		return true
	}
	return false
}

func (h *PortForwardConfigHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgPortForwardConfigList:
		return h.handleList(msg, writer)
	case models.MsgPortForwardConfigGet:
		return h.handleGet(msg, writer)
	case models.MsgPortForwardConfigCreate:
		return h.handleCreate(msg, writer)
	case models.MsgPortForwardConfigUpdate:
		return h.handleUpdate(msg, writer)
	case models.MsgPortForwardConfigDelete:
		return h.handleDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *PortForwardConfigHandler) handleList(msg *models.IPCMessage, writer ResponseWriter) error {
	configs := h.storage.GetAll()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgPortForwardConfigList,
		Data: configs,
	})
}

func (h *PortForwardConfigHandler) handleGet(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, _ := dataMap["id"].(string)
	if id == "" {
		return fmt.Errorf("id required")
	}

	config := h.storage.Get(id)
	if config == nil {
		return fmt.Errorf("port forward config not found")
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgPortForwardConfigGet,
		Data: config,
	})
}

func (h *PortForwardConfigHandler) handleCreate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var config models.PortForwardConfig
	if err := json.Unmarshal(jsonData, &config); err != nil {
		return fmt.Errorf("failed to parse port forward config: %w", err)
	}

	config.ID = uuid.New().String()

	if err := h.storage.Add(&config); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgPortForwardConfigCreate,
		Data: config,
	})
}

func (h *PortForwardConfigHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var config models.PortForwardConfig
	if err := json.Unmarshal(jsonData, &config); err != nil {
		return fmt.Errorf("failed to parse port forward config: %w", err)
	}

	if err := h.storage.Update(&config); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgPortForwardConfigUpdate,
		Data: config,
	})
}

func (h *PortForwardConfigHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, _ := dataMap["id"].(string)
	if id == "" {
		return fmt.Errorf("id required")
	}

	if err := h.storage.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgPortForwardConfigDelete,
		Data: map[string]string{"status": "deleted", "id": id},
	})
}
