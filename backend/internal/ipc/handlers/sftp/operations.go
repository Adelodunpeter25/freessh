package sftp

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
)

func (h *Handler) handleMkdir(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.MkdirRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse mkdir request: %w", err)
	}

	if err := h.manager.CreateDirectory(msg.SessionID, req.Path); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPMkdir,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "created", "path": req.Path},
	})
}

func (h *Handler) handleDelete(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.DeleteRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse delete request: %w", err)
	}

	if err := h.manager.DeleteFile(msg.SessionID, req.Path); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPDelete,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "deleted", "path": req.Path},
	})
}

func (h *Handler) handleRename(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.RenameRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse rename request: %w", err)
	}

	if err := h.manager.RenameFile(msg.SessionID, req.OldPath, req.NewPath); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPRename,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "renamed", "old_path": req.OldPath, "new_path": req.NewPath},
	})
}

func (h *Handler) handleChmod(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ChmodRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse chmod request: %w", err)
	}

	if err := h.manager.Chmod(msg.SessionID, req.Path, req.Mode); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPChmod,
		SessionID: msg.SessionID,
		Data:      map[string]interface{}{"status": "changed", "path": req.Path, "mode": req.Mode},
	})
}
