package sftp

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type Handler struct {
	manager *session.Manager
}

func NewHandler(manager *session.Manager) *Handler {
	return &Handler{
		manager: manager,
	}
}

func (h *Handler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgSFTPList, models.MsgSFTPUpload, models.MsgSFTPDownload,
		models.MsgSFTPDelete, models.MsgSFTPMkdir, models.MsgSFTPRename,
		models.MsgSFTPCancel, models.MsgSFTPReadFile, models.MsgSFTPWriteFile,
		models.MsgSFTPChmod:
		return true
	}
	return false
}

func (h *Handler) Handle(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
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

func (h *Handler) handleList(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
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
