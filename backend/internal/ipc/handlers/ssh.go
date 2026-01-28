package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type SSHHandler struct {
	manager            *session.Manager
	verificationHelper *HostKeyVerificationHelper
}

func NewSSHHandler(manager *session.Manager, verificationHelper *HostKeyVerificationHelper) *SSHHandler {
	return &SSHHandler{
		manager:            manager,
		verificationHelper: verificationHelper,
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

	verificationCallback := h.verificationHelper.CreateVerificationCallback(writer)
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
	return h.verificationHelper.HandleVerifyResponse(msg)
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
