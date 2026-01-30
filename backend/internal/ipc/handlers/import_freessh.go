package handlers

import (
	"encoding/json"
	"fmt"
	importpkg "freessh-backend/internal/import"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type ImportFreeSSHHandler struct {
	importManager *importpkg.Manager
}

func NewImportFreeSSHHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ImportFreeSSHHandler {
	keyStorage, _ := storage.NewKeyStorage()
	keyFileStorage, _ := storage.NewKeyFileStorage()
	
	return &ImportFreeSSHHandler{
		importManager: importpkg.NewManager(connStorage, groupStorage, pfStorage, keyStorage, keyFileStorage),
	}
}

func (h *ImportFreeSSHHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgImportFreeSSH
}

func (h *ImportFreeSSHHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ImportFreeSSHRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse import request: %w", err)
	}

	result, err := h.importManager.Import("freessh", req.Data)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgImportFreeSSH,
		Data: models.ImportFreeSSHResponse{
			ConnectionsImported:  result.ConnectionsImported,
			GroupsImported:       result.GroupsImported,
			PortForwardsImported: result.PortForwardsImported,
			KeysImported:         result.KeysImported,
			Errors:               result.Errors,
		},
	})
}
