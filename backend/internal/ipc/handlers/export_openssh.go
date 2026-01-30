package handlers

import (
	"fmt"
	"freessh-backend/internal/export"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"
)

type ExportOpenSSHHandler struct {
	exportManager *export.Manager
}

func NewExportOpenSSHHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ExportOpenSSHHandler {
	keyStorage, _ := storage.NewKeyStorage()
	keyFileStorage, _ := storage.NewKeyFileStorage()
	
	return &ExportOpenSSHHandler{
		exportManager: export.NewManager(connStorage, groupStorage, pfStorage, keyStorage, keyFileStorage),
	}
}

func (h *ExportOpenSSHHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgExportOpenSSH
}

func (h *ExportOpenSSHHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	data, err := h.exportManager.Export("openssh")
	if err != nil {
		return err
	}

	filename := fmt.Sprintf("freessh-openssh-export-%s", time.Now().Format("2006-01-02"))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgExportOpenSSH,
		Data: models.ExportOpenSSHResponse{
			Data:     string(data),
			Filename: filename,
		},
	})
}
