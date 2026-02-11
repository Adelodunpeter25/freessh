package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/history"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
	"strings"
	"sync"
)

const historyMarkerPrefix = "\x1b]1337;freessh-history="

type TerminalHandler struct {
	manager        *session.Manager
	historyManager *history.Manager
	markerBuffers  map[string]string
	mu             sync.Mutex
}

func NewTerminalHandler(manager *session.Manager, historyStorage *storage.HistoryStorage) *TerminalHandler {
	return &TerminalHandler{
		manager:        manager,
		historyManager: history.NewManager(historyStorage),
		markerBuffers:  make(map[string]string),
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
		return h.handleInput(msg, writer)
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

func (h *TerminalHandler) handleInput(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid input data: %w", err)
	}

	var inputData models.InputData
	if err := json.Unmarshal(jsonData, &inputData); err != nil {
		return fmt.Errorf("failed to parse input data: %w", err)
	}

	_ = writer
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
				h.captureShellHistory(sessionID, string(data), writer)
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

func (h *TerminalHandler) captureShellHistory(sessionID, output string, writer ResponseWriter) {
	h.mu.Lock()
	buffer := h.markerBuffers[sessionID] + output
	h.markerBuffers[sessionID] = ""
	h.mu.Unlock()

	for {
		start := strings.Index(buffer, historyMarkerPrefix)
		if start == -1 {
			// Keep a tail so markers split across chunks can be reconstructed.
			const keepTail = 128
			if len(buffer) > keepTail {
				buffer = buffer[len(buffer)-keepTail:]
			}
			h.mu.Lock()
			h.markerBuffers[sessionID] = buffer
			h.mu.Unlock()
			return
		}

		end := strings.IndexByte(buffer[start+len(historyMarkerPrefix):], '\a')
		if end == -1 {
			// Keep from marker start and wait for next chunk.
			h.mu.Lock()
			h.markerBuffers[sessionID] = buffer[start:]
			h.mu.Unlock()
			return
		}

		end += start + len(historyMarkerPrefix)
		command := strings.TrimSpace(buffer[start+len(historyMarkerPrefix) : end])
		if command != "" && !shouldIgnoreHistoryCommand(command) {
			entry, err := h.historyManager.Add(command)
			if err == nil && entry != nil {
				_ = writer.WriteMessage(&models.IPCMessage{
					Type: models.MsgHistoryAdd,
					Data: models.HistoryAddResponse{
						Entry: *entry,
					},
				})
			}
		}

		buffer = buffer[end+1:]
	}
}

func shouldIgnoreHistoryCommand(command string) bool {
	return strings.Contains(command, "__freessh_emit_history") ||
		strings.Contains(command, "__freessh_precmd") ||
		strings.Contains(command, "add-zsh-hook precmd") ||
		strings.Contains(command, "freessh-history=")
}
