package keys

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/keygen"
	"freessh-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

func (h *Handler) handleImport(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var data struct {
		Name       string `json:"name"`
		PrivateKey string `json:"privateKey"`
		Passphrase string `json:"passphrase"`
	}
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return fmt.Errorf("failed to parse import data: %w", err)
	}

	// Parse private key and extract public key
	result, err := keygen.ParsePrivateKey(data.PrivateKey, data.Passphrase)
	if err != nil {
		return fmt.Errorf("failed to parse private key: %w", err)
	}

	// Create key metadata
	key := models.SSHKey{
		ID:        uuid.New().String(),
		Name:      data.Name,
		Algorithm: result.Algorithm,
		Bits:      result.Bits,
		PublicKey: result.PublicKey,
		CreatedAt: time.Now(),
	}

	// Store private key in file
	if h.fileStorage != nil {
		if err := h.fileStorage.SavePrivateKey(key.ID, data.PrivateKey); err != nil {
			return fmt.Errorf("failed to store private key: %w", err)
		}
	}

	// Save key metadata
	if err := h.storage.Save(key); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyImport,
		Data: key,
	})
}
