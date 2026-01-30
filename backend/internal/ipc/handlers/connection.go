package handlers

import (
	"encoding/json"
	"fmt"
	"os"
	"freessh-backend/internal/connection"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
)

type ConnectionHandler struct {
	manager            *session.Manager
	verificationHelper *HostKeyVerificationHelper
	keyStorage         *storage.KeyStorage
	keyFileStorage     *storage.KeyFileStorage
}

func NewConnectionHandler(manager *session.Manager, verificationHelper *HostKeyVerificationHelper) *ConnectionHandler {
	keyStorage, _ := storage.NewKeyStorage()
	keyFileStorage, _ := storage.NewKeyFileStorage()
	
	return &ConnectionHandler{
		manager:            manager,
		verificationHelper: verificationHelper,
		keyStorage:         keyStorage,
		keyFileStorage:     keyFileStorage,
	}
}

func (h *ConnectionHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgConnectionList, models.MsgConnectionGet, models.MsgConnectionDelete, 
	     models.MsgConnectionUpdate, models.MsgConnectionConnect, models.MsgHostKeyVerifyResponse:
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
	case models.MsgHostKeyVerifyResponse:
		return h.handleVerifyResponse(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *ConnectionHandler) handleVerifyResponse(msg *models.IPCMessage, writer ResponseWriter) error {
	return h.verificationHelper.HandleVerifyResponse(msg)
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

	// Migrate embedded key to key storage if present
	if h.keyStorage != nil && h.keyFileStorage != nil {
		if err := connection.MigrateEmbeddedKey(&config, h.keyStorage, h.keyFileStorage); err != nil {
			return fmt.Errorf("failed to migrate key: %w", err)
		}
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
	fmt.Fprintf(os.Stderr, "[Backend] handleConnect called\n")
	
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[Backend] Failed to marshal data: %v\n", err)
		return fmt.Errorf("invalid data: %w", err)
	}

	var config models.ConnectionConfig
	if err := json.Unmarshal(jsonData, &config); err != nil {
		fmt.Fprintf(os.Stderr, "[Backend] Failed to unmarshal config: %v\n", err)
		return fmt.Errorf("failed to parse connection config: %w", err)
	}

	fmt.Fprintf(os.Stderr, "[Backend] Connecting to: %s@%s:%d\n", config.Username, config.Host, config.Port)

	// Migrate embedded key to key storage if present
	if h.keyStorage != nil && h.keyFileStorage != nil {
		if err := connection.MigrateEmbeddedKey(&config, h.keyStorage, h.keyFileStorage); err != nil {
			fmt.Fprintf(os.Stderr, "[Backend] Failed to migrate key: %v\n", err)
			return fmt.Errorf("failed to migrate key: %w", err)
		}
		// Save the updated config if migration happened
		if config.KeyID != "" && config.PrivateKey == "" {
			_ = h.manager.UpdateSavedConnection(config)
		}
	}

	fmt.Fprintf(os.Stderr, "[Backend] Creating session with verification\n")
	verificationCallback := h.verificationHelper.CreateVerificationCallback(writer)
	session, err := h.manager.CreateSessionWithVerification(config, verificationCallback)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[Backend] Failed to create session: %v\n", err)
		return err
	}

	fmt.Fprintf(os.Stderr, "[Backend] Session created successfully: %s\n", session.ID)
	msg.SessionID = session.ID

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSessionStatus,
		SessionID: session.ID,
		Data:      session,
	})
}
