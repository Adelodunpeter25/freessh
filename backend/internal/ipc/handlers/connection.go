package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type ConnectionHandler struct {
	manager *session.Manager
}

func NewConnectionHandler(manager *session.Manager) *ConnectionHandler {
	return &ConnectionHandler{
		manager: manager,
	}
}

func (h *ConnectionHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgConnectionList, models.MsgConnectionGet, models.MsgConnectionDelete, 
	     models.MsgConnectionUpdate, models.MsgConnectionConnect:
		return true
	}
	return false
}

func (h *ConnectionHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgConnectionList:
		return h.handleList(writer)
	case models.MsgConnectionGet:
		return h.handleGet(msg, writer)
	case models.MsgConnectionDelete:
		return h.handleDelete(msg, writer)
	case models.MsgConnectionUpdate:
		return h.handleUpdate(msg, writer)
	case models.MsgConnectionConnect:
		return h.handleConnect(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *ConnectionHandler) handleList(writer ResponseWriter) error {
	connections, err := h.manager.ListSavedConnections()
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgConnectionList,
		Data: connections,
	})
}

func (h *ConnectionHandler) handleGet(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, ok := dataMap["id"].(string)
	if !ok {
		return fmt.Errorf("connection id required")
	}

	connection, err := h.manager.GetSavedConnection(id)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgConnectionGet,
		Data: connection,
	})
}

func (h *ConnectionHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, ok := dataMap["id"].(string)
	if !ok {
		return fmt.Errorf("connection id required")
	}

	if err := h.manager.DeleteSavedConnection(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgConnectionDelete,
		Data: map[string]string{"status": "deleted", "id": id},
	})
}

func (h *ConnectionHandler) handleUpdate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var config models.ConnectionConfig
	if err := json.Unmarshal(jsonData, &config); err != nil {
		return fmt.Errorf("failed to parse connection config: %w", err)
	}

	if err := h.manager.UpdateSavedConnection(config); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgConnectionUpdate,
		Data: map[string]string{"status": "updated", "id": config.ID},
	})
}

func (h *ConnectionHandler) handleConnect(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var config models.ConnectionConfig
	if err := json.Unmarshal(jsonData, &config); err != nil {
		return fmt.Errorf("failed to parse connection config: %w", err)
	}

	session, err := h.manager.CreateSession(config)
	if err != nil {
		return err
	}

	// Store session ID in message for output streaming to be started
	msg.SessionID = session.ID

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSessionStatus,
		SessionID: session.ID,
		Data:      session,
	})
}
