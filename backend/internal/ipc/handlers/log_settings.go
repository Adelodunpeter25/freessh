package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/settings"
)

type LogSettingsHandler struct {
	storage *settings.LogSettingsStorage
}

func NewLogSettingsHandler(storage *settings.LogSettingsStorage) *LogSettingsHandler {
	return &LogSettingsHandler{
		storage: storage,
	}
}

func (h *LogSettingsHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgLogSettingsGet || msgType == models.MsgLogSettingsUpdate
}

func (h *LogSettingsHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgLogSettingsGet:
		return h.handleGet(writer)
	case models.MsgLogSettingsUpdate:
		return h.handleUpdate(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *LogSettingsHandler) handleGet(writer ResponseWriter) error {
	settings := h.storage.Get()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogSettingsGet,
		Data: settings,
	})
}

func (h *LogSettingsHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid settings data: %w", err)
	}

	var logSettings settings.LogSettings
	if err := json.Unmarshal(jsonData, &logSettings); err != nil {
		return fmt.Errorf("failed to parse settings: %w", err)
	}

	if err := h.storage.Update(logSettings); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogSettingsUpdate,
		Data: logSettings,
	})
}
