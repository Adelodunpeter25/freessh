package sftp

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
)

func (h *Handler) handleUpload(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.UploadRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse upload request: %w", err)
	}

	progressChan := make(chan models.TransferProgress, 10)

	go func() {
		for progress := range progressChan {
			writer.WriteMessage(&models.IPCMessage{
				Type:      models.MsgSFTPProgress,
				SessionID: msg.SessionID,
				Data:      progress,
			})
		}
	}()

	err = h.manager.UploadFile(msg.SessionID, req.LocalPath, req.RemotePath, progressChan)
	close(progressChan)

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPUpload,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "completed"},
	})
}

func (h *Handler) handleDownload(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.DownloadRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse download request: %w", err)
	}

	progressChan := make(chan models.TransferProgress, 10)

	go func() {
		for progress := range progressChan {
			writer.WriteMessage(&models.IPCMessage{
				Type:      models.MsgSFTPProgress,
				SessionID: msg.SessionID,
				Data:      progress,
			})
		}
	}()

	err = h.manager.DownloadFile(msg.SessionID, req.RemotePath, req.LocalPath, progressChan)
	close(progressChan)

	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPDownload,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "completed"},
	})
}

func (h *Handler) handleCancel(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.CancelRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse cancel request: %w", err)
	}

	cancelled := h.manager.CancelTransfer(req.TransferID)

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPCancel,
		SessionID: msg.SessionID,
		Data:      map[string]interface{}{"transfer_id": req.TransferID, "cancelled": cancelled},
	})
}
