package handlers

import (
	"fmt"
	"freessh-backend/internal/export"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"
)

type ExportFreeSSHHandler struct {
	exportManager *export.Manager
}

func NewExportFreeSSHHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ExportFreeSSHHandler {
	return &ExportFreeSSHHandler{
		exportManager: export.NewManager(connStorage, groupStorage, pfStorage),
	}
}

func (h *ExportFreeSSHHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgExportFreeSSH
}

func (h *ExportFreeSSHHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	data, err := h.exportManager.Export("freessh")
	if err != nil {
		return err
	}

	filename := fmt.Sprintf("freessh-export-%s.json", time.Now().Format("2006-01-02-150405"))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgExportFreeSSH,
		Data: models.ExportFreeSSHResponse{
			Data:     data,
			Filename: filename,
		},
	})
}
