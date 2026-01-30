package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/history"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
	"strings"
)

type TerminalHandler struct {
	manager        *session.Manager
	historyManager *history.Manager
	commandBuffers map[string]string
}

func NewTerminalHandler(manager *session.Manager, historyStorage *storage.HistoryStorage) *TerminalHandler {
	return &TerminalHandler{
		manager:        manager,
		historyManager: history.NewManager(historyStorage),
		commandBuffers: make(map[string]string),
	}
}

func (h *TerminalHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgInput || 
		msgType == models.MsgResize || 
		msgType == models.MsgTerminalStartLogging || 
		msgType == models.MsgTerminalStopLogging
}

func (h *TerminalHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgInput:
		return h.handleInput(msg)
	case models.MsgResize:
		return h.handleResize(msg)
	case models.MsgTerminalStartLogging:
		return h.handleStartLogging(msg, writer)
	case models.MsgTerminalStopLogging:
		return h.handleStopLogging(msg, writer)
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

	// Track command if it ends with newline or carriage return
	if strings.HasSuffix(inputData.Data, "\n") || strings.HasSuffix(inputData.Data, "\r") {
		command := strings.TrimSpace(h.commandBuffers[msg.SessionID])
		if command != "" {
			h.historyManager.Add(command)
		}
		h.commandBuffers[msg.SessionID] = ""
	} else {
		// Handle backspace/delete
		if inputData.Data == "\x7f" || inputData.Data == "\b" {
			buffer := h.commandBuffers[msg.SessionID]
			if len(buffer) > 0 {
				h.commandBuffers[msg.SessionID] = buffer[:len(buffer)-1]
			}
		} else if inputData.Data == "\x03" || inputData.Data == "\x04" {
			// Ctrl+C or Ctrl+D - clear buffer
			h.commandBuffers[msg.SessionID] = ""
		} else {
			// Accumulate command buffer (ignore other control characters)
			for _, r := range inputData.Data {
				if r >= 32 || r == '\t' {
					h.commandBuffers[msg.SessionID] += string(r)
				}
			}
		}
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

func (h *TerminalHandler) handleStartLogging(msg *models.IPCMessage, writer ResponseWriter) error {
	logPath, err := h.manager.StartLogging(msg.SessionID)
	if err != nil {
		return writer.WriteMessage(&models.IPCMessage{
			Type:      models.MsgTerminalLoggingStatus,
			SessionID: msg.SessionID,
			Data: map[string]interface{}{
				"is_logging": false,
				"error":      err.Error(),
			},
		})
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgTerminalLoggingStatus,
		SessionID: msg.SessionID,
		Data: map[string]interface{}{
			"is_logging": true,
			"file_path":  logPath,
		},
	})
}

func (h *TerminalHandler) handleStopLogging(msg *models.IPCMessage, writer ResponseWriter) error {
	err := h.manager.StopLogging(msg.SessionID)
	if err != nil {
		return writer.WriteMessage(&models.IPCMessage{
			Type:      models.MsgTerminalLoggingStatus,
			SessionID: msg.SessionID,
			Data: map[string]interface{}{
				"is_logging": true,
				"error":      err.Error(),
			},
		})
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type:      models.MsgTerminalLoggingStatus,
		SessionID: msg.SessionID,
		Data: map[string]interface{}{
			"is_logging": false,
		},
	})
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
