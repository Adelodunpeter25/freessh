package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"

	"github.com/google/uuid"
)

type KeysHandler struct {
	storage *storage.KeyStorage
}

func NewKeysHandler() *KeysHandler {
	keyStorage, err := storage.NewKeyStorage()
	if err != nil {
		keyStorage = nil
	}

	return &KeysHandler{
		storage: keyStorage,
	}
}

func (h *KeysHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKeyList, models.MsgKeySave, models.MsgKeyDelete:
		return true
	}
	return false
}

func (h *KeysHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	if h.storage == nil {
		return fmt.Errorf("key storage not available")
	}

	switch msg.Type {
	case models.MsgKeyList:
		return h.handleList(writer)
	case models.MsgKeySave:
		return h.handleSave(msg, writer)
	case models.MsgKeyDelete:
		return h.handleDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *KeysHandler) handleList(writer ResponseWriter) error {
	keys := h.storage.List()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyList,
		Data: keys,
	})
}

func (h *KeysHandler) handleSave(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var key models.SSHKey
	if err := json.Unmarshal(jsonData, &key); err != nil {
		return fmt.Errorf("failed to parse key: %w", err)
	}

	if key.ID == "" {
		key.ID = uuid.New().String()
	}
	if key.CreatedAt.IsZero() {
		key.CreatedAt = time.Now()
	}

	if err := h.storage.Save(key); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeySave,
		Data: key,
	})
}

func (h *KeysHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, ok := dataMap["id"].(string)
	if !ok {
		return fmt.Errorf("key id required")
	}

	if err := h.storage.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyDelete,
		Data: map[string]string{"status": "deleted", "id": id},
	})
}
