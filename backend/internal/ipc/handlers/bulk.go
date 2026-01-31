package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type BulkHandler struct {
	manager *session.Manager
}

func NewBulkHandler(manager *session.Manager) *BulkHandler {
	return &BulkHandler{
		manager: manager,
	}
}

func (h *BulkHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgBulkDownload, models.MsgBulkUpload, models.MsgBulkDelete:
		return true
	}
	return false
}

func (h *BulkHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgBulkDownload:
		return h.handleBulkDownload(msg, writer)
	case models.MsgBulkUpload:
		return h.handleBulkUpload(msg, writer)
	case models.MsgBulkDelete:
		return h.handleBulkDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *BulkHandler) handleBulkDownload(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.BulkDownloadRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse bulk download request: %w", err)
	}

	results, err := h.manager.BulkDownload(msg.SessionID, req.RemotePaths, req.LocalBaseDir, func(progress models.BulkProgress) {
		writer.WriteMessage(&models.IPCMessage{
			Type:      models.MsgBulkProgress,
			SessionID: msg.SessionID,
			Data:      progress,
		})
	})

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgBulkDownload,
		SessionID: msg.SessionID,
		Data:      results,
	})
}

func (h *BulkHandler) handleBulkUpload(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.BulkUploadRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse bulk upload request: %w", err)
	}

	results, err := h.manager.BulkUpload(msg.SessionID, req.LocalPaths, req.RemoteBaseDir, func(progress models.BulkProgress) {
		writer.WriteMessage(&models.IPCMessage{
			Type:      models.MsgBulkProgress,
			SessionID: msg.SessionID,
			Data:      progress,
		})
	})

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgBulkUpload,
		SessionID: msg.SessionID,
		Data:      results,
	})
}

func (h *BulkHandler) handleBulkDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.BulkDeleteRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse bulk delete request: %w", err)
	}

	results, err := h.manager.BulkDelete(msg.SessionID, req.RemotePaths, func(progress models.BulkProgress) {
		writer.WriteMessage(&models.IPCMessage{
			Type:      models.MsgBulkProgress,
			SessionID: msg.SessionID,
			Data:      progress,
		})
	})

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgBulkDelete,
		SessionID: msg.SessionID,
		Data:      results,
	})
}
