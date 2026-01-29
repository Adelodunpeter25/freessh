package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type SettingsHandler struct {
	storage *storage.SettingsStorage
}

func NewSettingsHandler(storage *storage.SettingsStorage) *SettingsHandler {
	return &SettingsHandler{
		storage: storage,
	}
}

func (h *SettingsHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgSettingsGet || msgType == models.MsgSettingsUpdate
}

func (h *SettingsHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgSettingsGet:
		return h.handleGet(writer)
	case models.MsgSettingsUpdate:
		return h.handleUpdate(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *SettingsHandler) handleGet(writer ResponseWriter) error {
	settings := h.storage.Get()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSettingsGet,
		Data: settings,
	})
}

func (h *SettingsHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid settings data: %w", err)
	}

	var settings storage.Settings
	if err := json.Unmarshal(jsonData, &settings); err != nil {
		return fmt.Errorf("failed to parse settings: %w", err)
	}

	if err := h.storage.Update(settings); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSettingsUpdate,
		Data: settings,
	})
}
