package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type PortForwardHandler struct {
	manager *session.Manager
}

func NewPortForwardHandler(manager *session.Manager) *PortForwardHandler {
	return &PortForwardHandler{
		manager: manager,
	}
}

func (h *PortForwardHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgPortForwardCreate, models.MsgPortForwardStop, models.MsgPortForwardList:
		return true
	}
	return false
}

func (h *PortForwardHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgPortForwardCreate:
		return h.handleCreate(msg, writer)
	case models.MsgPortForwardStop:
		return h.handleStop(msg, writer)
	case models.MsgPortForwardList:
		return h.handleList(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *PortForwardHandler) handleCreate(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.CreateTunnelRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse create tunnel request: %w", err)
	}

	tunnel, err := h.manager.CreateTunnel(msg.SessionID, req.Config)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgPortForwardCreate,
		SessionID: msg.SessionID,
		Data:      tunnel,
	})
}

func (h *PortForwardHandler) handleStop(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.StopTunnelRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse stop tunnel request: %w", err)
	}

	if err := h.manager.StopTunnel(msg.SessionID, req.TunnelID); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgPortForwardStop,
		SessionID: msg.SessionID,
		Data:      map[string]string{"status": "stopped", "tunnel_id": req.TunnelID},
	})
}

func (h *PortForwardHandler) handleList(msg *models.IPCMessage, writer ResponseWriter) error {
	tunnels := h.manager.ListTunnels(msg.SessionID)

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgPortForwardList,
		SessionID: msg.SessionID,
		Data:      tunnels,
	})
}
