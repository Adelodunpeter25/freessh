package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/export"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"
)

type ExportHandler struct {
	exportManager *export.Manager
}

func NewExportHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ExportHandler {
	return &ExportHandler{
		exportManager: export.NewManager(connStorage, groupStorage, pfStorage),
	}
}

func (h *ExportHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgExport
}

func (h *ExportHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	return h.handleExport(msg, writer)
}

func (h *ExportHandler) handleExport(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ExportRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse export request: %w", err)
	}

	data, err := h.exportManager.Export(req.Format)
	if err != nil {
		return err
	}

	filename := fmt.Sprintf("freessh-export-%s.json", time.Now().Format("2006-01-02-150405"))

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgExport,
		Data: models.ExportResponse{
			Data:     data,
			Filename: filename,
		},
	})
}
