package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/keychain"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/ssh"
	"freessh-backend/internal/storage"
	"time"

	"github.com/google/uuid"
)

type KeysHandler struct {
	storage *storage.KeyStorage
	manager *session.Manager
}

func NewKeysHandler(manager *session.Manager) *KeysHandler {
	keyStorage, err := storage.NewKeyStorage()
	if err != nil {
		keyStorage = nil
	}

	return &KeysHandler{
		storage: keyStorage,
		manager: manager,
	}
}

func (h *KeysHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKeyList, models.MsgKeySave, models.MsgKeyUpdate, models.MsgKeyDelete, models.MsgKeyExport:
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
	case models.MsgKeyUpdate:
		return h.handleUpdate(msg, writer)
	case models.MsgKeyDelete:
		return h.handleDelete(msg, writer)
	case models.MsgKeyExport:
		return h.handleExport(msg, writer)
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

	// Store private key in keychain
	kc := keychain.New()
	if err := kc.Set(data.Key.ID+":private_key", data.PrivateKey); err != nil {
		return fmt.Errorf("failed to store private key: %w", err)
	}

	if err := h.storage.Save(data.Key); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeySave,
		Data: data.Key,
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

func (h *KeysHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *KeysHandler) handleExport(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	keyID, ok := dataMap["key_id"].(string)
	if !ok {
		return fmt.Errorf("key_id required")
	}

	connectionID, ok := dataMap["connection_id"].(string)
	if !ok {
		return fmt.Errorf("connection_id required")
	}

	key, err := h.storage.Get(keyID)
	if err != nil {
		return err
	}

	// Get private key from keychain
	kc := keychain.New()
	privateKey, err := kc.Get(keyID + ":private_key")
	if err != nil {
		return fmt.Errorf("private key not found in keychain: %w", err)
	}

	// Get connection config
	config, err := h.manager.GetSavedConnection(connectionID)
	if err != nil {
		return fmt.Errorf("connection not found: %w", err)
	}

	// Export key to the connection
	if err := ssh.ExportKeyToConnection(*config, key.PublicKey, privateKey); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyExport,
		Data: map[string]string{"status": "exported", "key_id": keyID, "connection_id": connectionID},
	})
}
