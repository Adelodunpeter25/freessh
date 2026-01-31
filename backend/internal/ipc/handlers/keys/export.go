package keys

import (
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"freessh-backend/internal/ssh"
)

func (h *Handler) handleExport(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
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

	// Get private key from file storage
	var privateKey string
	if h.fileStorage != nil {
		privateKey, err = h.fileStorage.GetPrivateKey(keyID)
		if err != nil {
			return fmt.Errorf("private key not found: %w", err)
		}
	}

	// Get connection config
	config, err := h.manager.GetSavedConnection(connectionID)
	if err != nil {
		return fmt.Errorf("connection not found: %w", err)
	}

	// Export key to the connection
	if err := ssh.ExportKeyToConnection(*config, key.PublicKey, privateKey, key.Name); err != nil {
		return err
	}

	// Update connection to use this key for future authentication
	config.AuthMethod = models.AuthPublicKey
	config.KeyID = keyID
	config.PrivateKey = "" // Clear any old key content

	if err := h.manager.GetStorage().Update(*config); err != nil {
		return fmt.Errorf("failed to update connection: %w", err)
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyExport,
		Data: map[string]string{"status": "exported", "key_id": keyID, "connection_id": connectionID},
	})
}
