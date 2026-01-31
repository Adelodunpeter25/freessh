package sftp

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
)

func (h *Handler) handleReadFile(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ReadFileRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse read file request: %w", err)
	}

	content, err := h.manager.ReadFile(msg.SessionID, req.Path, req.Binary)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPReadFile,
		SessionID: msg.SessionID,
		Data:      models.ReadFileResponse{Content: content, Path: req.Path},
	})
}

func (h *Handler) handleWriteFile(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.WriteFileRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse write file request: %w", err)
	}

	if err := h.manager.WriteFile(msg.SessionID, req.Path, req.Content); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPWriteFile,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "saved", "path": req.Path},
	})
}
