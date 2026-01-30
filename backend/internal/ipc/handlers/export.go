package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/export"
	importpkg "freessh-backend/internal/import"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"
)

type ExportImportHandler struct {
	exportManager *export.Manager
	importManager *importpkg.Manager
}

func NewExportImportHandler(connStorage *storage.ConnectionStorage, groupStorage *storage.GroupStorage, pfStorage *storage.PortForwardStorage) *ExportImportHandler {
	return &ExportImportHandler{
		exportManager: export.NewManager(connStorage, groupStorage, pfStorage),
		importManager: importpkg.NewManager(connStorage, groupStorage, pfStorage),
	}
}

func (h *ExportImportHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgExport, models.MsgImport:
		return true
	}
	return false
}

func (h *ExportImportHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgExport:
		return h.handleExport(msg, writer)
	case models.MsgImport:
		return h.handleImport(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *ExportImportHandler) handleExport(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *ExportImportHandler) handleImport(msg *models.IPCMessage, writer ResponseWriter) error {
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
