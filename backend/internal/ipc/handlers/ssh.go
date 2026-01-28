package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"sync"
	"time"
)

type SSHHandler struct {
	manager *session.Manager
	verificationChannels map[string]chan bool
	mu sync.Mutex
}

func NewSSHHandler(manager *session.Manager) *SSHHandler {
	return &SSHHandler{
		manager: manager,
		verificationChannels: make(map[string]chan bool),
	}
}

func (h *SSHHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgConnect || msgType == models.MsgDisconnect || msgType == models.MsgHostKeyVerifyResponse
}

func (h *SSHHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgConnect:
		return h.handleConnect(msg, writer)
	case models.MsgDisconnect:
		return h.handleDisconnect(msg, writer)
	case models.MsgHostKeyVerifyResponse:
		return h.handleVerifyResponse(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *SSHHandler) handleConnect(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid connect data: %w", err)
	}

	var req models.ConnectRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse connect request: %w", err)
	}

	// Create verification callback that waits for frontend response
	verificationCallback := func(verification *models.HostKeyVerification) error {
		// Create unique key for this verification
		verifyKey := fmt.Sprintf("%s:%d", verification.Hostname, verification.Port)
		
		// Create response channel
		responseChan := make(chan bool, 1)
		h.mu.Lock()
		h.verificationChannels[verifyKey] = responseChan
		h.mu.Unlock()
		
		// Clean up channel when done
		defer func() {
			h.mu.Lock()
			delete(h.verificationChannels, verifyKey)
			h.mu.Unlock()
		}()
		
		// Send verification request to frontend
		if err := writer.WriteMessage(&models.IPCMessage{
			Type: models.MsgHostKeyVerify,
			Data: verification,
		}); err != nil {
			return err
		}

		// Wait for response with timeout
		select {
		case trusted := <-responseChan:
			if !trusted {
				return fmt.Errorf("user rejected host key")
			}
			return nil
		case <-time.After(60 * time.Second):
			return fmt.Errorf("host key verification timeout")
		}
	}

	session, err := h.manager.CreateSessionWithVerification(req.Config, verificationCallback)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSessionStatus,
		SessionID: session.ID,
		Data:      session,
	})
}

func (h *SSHHandler) handleVerifyResponse(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid verify response data")
	}

	hostname, _ := dataMap["hostname"].(string)
	port, _ := dataMap["port"].(float64)
	trusted, _ := dataMap["trusted"].(bool)

	verifyKey := fmt.Sprintf("%s:%d", hostname, int(port))
	
	h.mu.Lock()
	responseChan, exists := h.verificationChannels[verifyKey]
	h.mu.Unlock()

	if !exists {
		return fmt.Errorf("no pending verification for %s", verifyKey)
	}

	// Send response to waiting goroutine
	responseChan <- trusted
	
	return nil
}

func (h *SSHHandler) handleDisconnect(msg *models.IPCMessage, writer ResponseWriter) error {
	if err := h.manager.CloseSession(msg.SessionID); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgSessionStatus,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "disconnected"},
	})
}
