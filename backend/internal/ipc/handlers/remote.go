package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/sftp/remote"

	"github.com/google/uuid"
)

type RemoteHandler struct {
	manager *session.Manager
}

func NewRemoteHandler(manager *session.Manager) *RemoteHandler {
	return &RemoteHandler{
		manager: manager,
	}
}

func (h *RemoteHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgRemoteTransfer, models.MsgBulkRemoteTransfer, models.MsgRemoteCancel:
		return true
	}
	return false
}

func (h *RemoteHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgRemoteTransfer:
		return h.handleRemoteTransfer(msg, writer)
	case models.MsgBulkRemoteTransfer:
		return h.handleBulkRemoteTransfer(msg, writer)
	case models.MsgRemoteCancel:
		return h.handleRemoteCancel(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *RemoteHandler) handleRemoteTransfer(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req remote.RemoteTransferRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse remote transfer request: %w", err)
	}

	transferID := uuid.New().String()

	err = h.manager.RemoteTransfer(
		req.SourceSessionID,
		req.DestSessionID,
		req.SourcePath,
		req.DestPath,
		func(transferred, total int64) {
			go writer.WriteMessage(&models.IPCMessage{
				Type: models.MsgRemoteProgress,
				Data: remote.RemoteTransferProgress{
					TotalItems:       1,
					CompletedItems:   0,
					FailedItems:      0,
					CurrentItem:      req.SourcePath,
					BytesTransferred: transferred,
					TotalBytes:       total,
				},
			})
		},
		transferID,
	)

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgRemoteTransfer,
		Data: remote.RemoteTransferResult{
			SourcePath: req.SourcePath,
			DestPath:   req.DestPath,
			Success:    true,
		},
	})
}

func (h *RemoteHandler) handleBulkRemoteTransfer(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req remote.BulkRemoteTransferRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse bulk remote transfer request: %w", err)
	}

	transferID := uuid.New().String()

	results := h.manager.BulkRemoteTransfer(
		req.SourceSessionID,
		req.DestSessionID,
		req.SourcePaths,
		req.DestDir,
		func(progress remote.RemoteTransferProgress) {
			go writer.WriteMessage(&models.IPCMessage{
				Type: models.MsgRemoteProgress,
				Data: progress,
			})
		},
		transferID,
	)

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgBulkRemoteTransfer,
		Data: results,
	})
}

func (h *RemoteHandler) handleRemoteCancel(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req struct {
		TransferID string `json:"transfer_id"`
	}
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse cancel request: %w", err)
	}

	cancelled := h.manager.CancelRemoteTransfer(req.TransferID)

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgRemoteCancel,
		Data: map[string]interface{}{"transfer_id": req.TransferID, "cancelled": cancelled},
	})
}
