package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type SFTPHandler struct {
	manager *session.Manager
}

func NewSFTPHandler(manager *session.Manager) *SFTPHandler {
	return &SFTPHandler{
		manager: manager,
	}
}

func (h *SFTPHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgSFTPList, models.MsgSFTPUpload, models.MsgSFTPDownload,
		models.MsgSFTPDelete, models.MsgSFTPMkdir, models.MsgSFTPRename, 
		models.MsgSFTPCancel, models.MsgSFTPReadFile, models.MsgSFTPWriteFile,
		models.MsgSFTPChmod:
		return true
	}
	return false
}

func (h *SFTPHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgSFTPList:
		return h.handleList(msg, writer)
	case models.MsgSFTPUpload:
		return h.handleUpload(msg, writer)
	case models.MsgSFTPDownload:
		return h.handleDownload(msg, writer)
	case models.MsgSFTPDelete:
		return h.handleDelete(msg, writer)
	case models.MsgSFTPMkdir:
		return h.handleMkdir(msg, writer)
	case models.MsgSFTPRename:
		return h.handleRename(msg, writer)
	case models.MsgSFTPCancel:
		return h.handleCancel(msg, writer)
	case models.MsgSFTPReadFile:
		return h.handleReadFile(msg, writer)
	case models.MsgSFTPWriteFile:
		return h.handleWriteFile(msg, writer)
	case models.MsgSFTPChmod:
		return h.handleChmod(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *SFTPHandler) handleList(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.ListRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse list request: %w", err)
	}

	files, err := h.manager.ListFiles(msg.SessionID, req.Path)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSFTPList,
		SessionID: msg.SessionID,
		Data:      files,
	})
}

func (h *SFTPHandler) handleUpload(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleDownload(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleMkdir(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleRename(msg *models.IPCMessage, writer ResponseWriter) error {
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


func (h *SFTPHandler) handleCancel(msg *models.IPCMessage, writer ResponseWriter) error {
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


func (h *SFTPHandler) handleReadFile(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleWriteFile(msg *models.IPCMessage, writer ResponseWriter) error {
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

func (h *SFTPHandler) handleChmod(msg *models.IPCMessage, writer ResponseWriter) error {
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

