package handlers

import (
	"encoding/json"
	"fmt"
	importpkg "freessh-backend/internal/import"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type ImportOpenSSHHandler struct {
	importManager *importpkg.Manager
}

func NewImportOpenSSHHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ImportOpenSSHHandler {
	keyStorage, _ := storage.NewKeyStorage()
	keyFileStorage, _ := storage.NewKeyFileStorage()
	
	return &ImportOpenSSHHandler{
		importManager: importpkg.NewManager(connStorage, groupStorage, pfStorage, keyStorage, keyFileStorage),
	}
}

func (h *ImportOpenSSHHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgImportOpenSSH
}

func (h *ImportOpenSSHHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ImportOpenSSHRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse import request: %w", err)
	}

	result, err := h.importManager.Import("openssh", req.Data)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgImportOpenSSH,
		Data: models.ImportOpenSSHResponse{
			ConnectionsImported: result.ConnectionsImported,
			KeysImported:        result.KeysImported,
			Errors:              result.Errors,
		},
	})
}
