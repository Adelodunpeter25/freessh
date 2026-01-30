package handlers

import (
	"encoding/json"
	"fmt"
	importpkg "freessh-backend/internal/import"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type ImportHandler struct {
	importManager *importpkg.Manager
}

func NewImportHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ImportHandler {
	return &ImportHandler{
		importManager: importpkg.NewManager(connStorage, groupStorage, pfStorage),
	}
}

func (h *ImportHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgImport
}

func (h *ImportHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	return h.handleImport(msg, writer)
}

func (h *ImportHandler) handleImport(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ImportRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse import request: %w", err)
	}

	result, err := h.importManager.Import(req.Format, req.Data)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgImport,
		Data: models.ImportResponse{
			ConnectionsImported:  result.ConnectionsImported,
			GroupsImported:       result.GroupsImported,
			PortForwardsImported: result.PortForwardsImported,
			Errors:               result.Errors,
		},
	})
}
