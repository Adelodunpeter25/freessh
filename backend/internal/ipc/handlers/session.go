package handlers

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
)

type SessionHandler struct {
	manager        *session.Manager
	historyStorage *storage.HistoryStorage
}

func NewSessionHandler(manager *session.Manager, historyStorage *storage.HistoryStorage) *SessionHandler {
	return &SessionHandler{
		manager:        manager,
		historyStorage: historyStorage,
	}
}

func (h *SessionHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgSessionList || msgType == models.MsgConnectLocal
}

func (h *SessionHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgSessionList:
		return h.handleListSessions(writer)
	case models.MsgConnectLocal:
		return h.handleConnectLocal(msg, writer)
	default:
		return nil
	}
}

func (h *SessionHandler) handleListSessions(writer ResponseWriter) error {
	sessions := h.manager.GetAllSessions()
	
	sessionList := make([]models.Session, 0, len(sessions))
	for _, as := range sessions {
		sessionList = append(sessionList, as.Session)
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSessionList,
		Data: sessionList,
	})
}

func (h *SessionHandler) handleConnectLocal(msg *models.IPCMessage, writer ResponseWriter) error {
	session, err := h.manager.CreateLocalSession()
	if err != nil {
		return writer.WriteMessage(&models.IPCMessage{
			Type: models.MsgSessionStatus,
			Data: session,
		})
	}

	writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgSessionStatus,
		Data: session,
	})

	terminalHandler := NewTerminalHandler(h.manager, h.historyStorage)
	terminalHandler.StartOutputStreaming(session.ID, writer)

	return nil
}
