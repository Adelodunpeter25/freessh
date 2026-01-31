package keys

import (
	"fmt"
	"freessh-backend/internal/ipc/handlers"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
)

type Handler struct {
	storage     *storage.KeyStorage
	fileStorage *storage.KeyFileStorage
	manager     *session.Manager
}

func NewHandler(manager *session.Manager) *Handler {
	keyStorage, err := storage.NewKeyStorage()
	if err != nil {
		keyStorage = nil
	}

	fileStorage, err := storage.NewKeyFileStorage()
	if err != nil {
		fileStorage = nil
	}

	return &Handler{
		storage:     keyStorage,
		fileStorage: fileStorage,
		manager:     manager,
	}
}

func (h *Handler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKeyList, models.MsgKeySave, models.MsgKeyImport, models.MsgKeyUpdate, models.MsgKeyDelete, models.MsgKeyExport:
		return true
	}
	return false
}

func (h *Handler) Handle(msg *models.IPCMessage, writer handlers.ResponseWriter) error {
	if h.storage == nil {
		return fmt.Errorf("key storage not available")
	}

	switch msg.Type {
	case models.MsgKeyList:
		return h.handleList(writer)
	case models.MsgKeySave:
		return h.handleSave(msg, writer)
	case models.MsgKeyImport:
		return h.handleImport(msg, writer)
	case models.MsgKeyUpdate:
		return h.handleUpdate(msg, writer)
	case models.MsgKeyDelete:
		return h.handleDelete(msg, writer)
	case models.MsgKeyExport:
		return h.handleExport(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *Handler) handleList(writer handlers.ResponseWriter) error {
	keys := h.storage.List()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeyList,
		Data: keys,
	})
}
