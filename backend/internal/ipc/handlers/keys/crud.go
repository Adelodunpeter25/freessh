package keys

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

func (h *Handler) handleSave(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var data struct {
		Key        models.SSHKey `json:"key"`
		PrivateKey string        `json:"privateKey"`
	}
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return fmt.Errorf("failed to parse key: %w", err)
	}

	if data.Key.ID == "" {
		data.Key.ID = uuid.New().String()
	}
	if data.Key.CreatedAt.IsZero() {
		data.Key.CreatedAt = time.Now()
	}

	// Store private key in file
	if h.fileStorage != nil {
		if err := h.fileStorage.SavePrivateKey(data.Key.ID, data.PrivateKey); err != nil {
			return fmt.Errorf("failed to store private key: %w", err)
		}
	}

	if err := h.storage.Save(data.Key); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeySave,
		Data: data.Key,
	})
}

func (h *Handler) handleUpdate(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var key models.SSHKey
	if err := json.Unmarshal(jsonData, &key); err != nil {
		return fmt.Errorf("failed to parse key: %w", err)
	}

	if err := h.storage.Update(key); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyUpdate,
		Data: key,
	})
}

func (h *Handler) handleDelete(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, ok := dataMap["id"].(string)
	if !ok {
		return fmt.Errorf("key id required")
	}

	// Delete private key file
	if h.fileStorage != nil {
		_ = h.fileStorage.DeletePrivateKey(id) // Ignore error if file doesn't exist
	}

	if err := h.storage.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyDelete,
		Data: map[string]string{"status": "deleted", "id": id},
	})
}
