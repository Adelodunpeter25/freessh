package handlers

import "freessh-backend/internal/models"

type Handler interface {
	Handle(msg *models.IPCMessage, writer ResponseWriter) error
	CanHandle(msgType models.MessageType) bool
}

type ResponseWriter interface {
	WriteMessage(msg *models.IPCMessage) error
	WriteError(sessionID string, err error) error
}
