package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/freesshhistory"
	"freessh-backend/internal/history"
	"freessh-backend/internal/models"
	"freessh-backend/internal/session"
	"freessh-backend/internal/storage"
	"strings"
	"sync"
)

type localInputState struct {
	buffer   []rune
	inEscape bool
}

type TerminalHandler struct {
	manager        *session.Manager
	historyManager *history.Manager
	markerBuffers  map[string]string
	localInputs    map[string]*localInputState
	mu             sync.Mutex
}

func NewTerminalHandler(manager *session.Manager, historyStorage *storage.HistoryStorage) *TerminalHandler {
	return &TerminalHandler{
		manager:        manager,
		historyManager: history.NewManager(historyStorage),
		markerBuffers:  make(map[string]string),
		localInputs:    make(map[string]*localInputState),
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

	h.captureLocalInputHistory(msg.SessionID, inputData.Data, writer)
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
		defer func() {
			h.mu.Lock()
			delete(h.markerBuffers, sessionID)
			delete(h.localInputs, sessionID)
			h.mu.Unlock()
		}()

		for {
			select {
			case <-activeSession.StopChannel():
				return
			case data, ok := <-activeSession.OutputChan:
				if !ok {
					return
				}
				rawOutput := string(data)
				h.captureShellHistory(sessionID, rawOutput, writer)

				if freesshhistory.ContainsBootstrapFragment(rawOutput) {
					continue
				}

				output := freesshhistory.SanitizeLogContent(rawOutput)
				if output == "" {
					continue
				}
				writer.WriteMessage(&models.IPCMessage{
					Type:      models.MsgOutput,
					SessionID: sessionID,
					Data:      map[string]string{"output": output},
				})
			case err, ok := <-activeSession.ErrorChan:
				if !ok {
					return
				}

				// Treat stream termination as session disconnect so UI can react consistently.
				if err != nil {
					_ = h.manager.CloseSession(sessionID)

					status := "error"
					errorMessage := err.Error()
					if strings.Contains(strings.ToLower(errorMessage), "closed") || strings.Contains(strings.ToLower(errorMessage), "eof") {
						status = "disconnected"
					}

					_ = writer.WriteMessage(&models.IPCMessage{
						Type:      models.MsgSessionStatus,
						SessionID: sessionID,
						Data: map[string]string{
							"status": status,
							"error":  errorMessage,
							"reason": "stream_error",
						},
					})
					return
				}
			}
		}
	}()
}

func (h *TerminalHandler) captureShellHistory(sessionID, output string, writer ResponseWriter) {
	h.mu.Lock()
	buffer := h.markerBuffers[sessionID] + output
	commands, remaining := freesshhistory.ParseMarkers(buffer)
	h.markerBuffers[sessionID] = remaining
	h.mu.Unlock()

	for _, command := range commands {
		if freesshhistory.IsBootstrapCommand(command) {
			continue
		}
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
}

func (h *TerminalHandler) captureLocalInputHistory(sessionID, input string, writer ResponseWriter) {
	activeSession, err := h.manager.GetSession(sessionID)
	if err != nil || activeSession.LocalTerminal == nil {
		return
	}

	h.mu.Lock()
	state, ok := h.localInputs[sessionID]
	if !ok {
		state = &localInputState{}
		h.localInputs[sessionID] = state
	}

	flush := false
	for _, r := range input {
		switch {
		case state.inEscape:
			// Consume VT sequence until a final byte in the @..~ range.
			if r >= '@' && r <= '~' {
				state.inEscape = false
			}
		case r == 0x1b:
			state.inEscape = true
		case r == '\r' || r == '\n':
			flush = true
		case r == 0x7f || r == 0x08:
			if len(state.buffer) > 0 {
				state.buffer = state.buffer[:len(state.buffer)-1]
			}
		case r == 0x15 || r == 0x03: // Ctrl+U clears line, Ctrl+C cancels line.
			state.buffer = state.buffer[:0]
		default:
			if r >= 0x20 {
				state.buffer = append(state.buffer, r)
			}
		}
	}

	var command string
	if flush {
		command = strings.TrimSpace(string(state.buffer))
		state.buffer = state.buffer[:0]
	}
	h.mu.Unlock()

	if command == "" || freesshhistory.IsBootstrapCommand(command) {
		return
	}

	entry, addErr := h.historyManager.Add(command)
	if addErr != nil || entry == nil {
		return
	}

	_ = writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgHistoryAdd,
		Data: models.HistoryAddResponse{
			Entry: *entry,
		},
	})
}
