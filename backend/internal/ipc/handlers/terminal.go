package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
)

type TerminalHandler struct {
	manager *session.Manager
}

func NewTerminalHandler(manager *session.Manager) *TerminalHandler {
	return &TerminalHandler{
		manager: manager,
	}
}

func (h *TerminalHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgInput || msgType == models.MsgResize
}

func (h *TerminalHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgInput:
		return h.handleInput(msg)
	case models.MsgResize:
		return h.handleResize(msg)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *TerminalHandler) handleInput(msg *models.IPCMessage) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid input data: %w", err)
	}

	var inputData models.InputData
	if err := json.Unmarshal(jsonData, &inputData); err != nil {
		return fmt.Errorf("failed to parse input data: %w", err)
	}

	return h.manager.SendInput(msg.SessionID, []byte(inputData.Data))
}

func (h *TerminalHandler) handleResize(msg *models.IPCMessage) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid resize data: %w", err)
	}

	var resizeData models.ResizeData
	if err := json.Unmarshal(jsonData, &resizeData); err != nil {
		return fmt.Errorf("failed to parse resize data: %w", err)
	}

	return h.manager.ResizeTerminal(msg.SessionID, resizeData.Rows, resizeData.Cols)
}

func (h *TerminalHandler) StartOutputStreaming(sessionID string, writer ResponseWriter) {
	activeSession, err := h.manager.GetSession(sessionID)
	if err != nil {
		return
	}

	go func() {
		for {
			select {
			case data, ok := <-activeSession.OutputChan:
				if !ok {
					return
				}
				writer.WriteMessage(&models.IPCMessage{
					Type:      models.MsgOutput,
					SessionID: sessionID,
					Data:      map[string]string{"output": string(data)},
				})
			case err, ok := <-activeSession.ErrorChan:
				if !ok {
					return
				}
				writer.WriteError(sessionID, err)
			}
		}
	}()
}
