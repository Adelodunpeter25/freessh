package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/logs"
	"freessh-backend/internal/models"
)

type LogHandler struct {
	manager *logs.Manager
}

func NewLogHandler() *LogHandler {
	return &LogHandler{
		manager: logs.NewManager(),
	}
}

func (h *LogHandler) CanHandle(msgType models.MessageType) bool {
	return msgType == models.MsgLogList ||
		msgType == models.MsgLogRead ||
		msgType == models.MsgLogDelete ||
		msgType == models.MsgLogDeleteAll
}

func (h *LogHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgLogList:
		return h.handleList(writer)
	case models.MsgLogRead:
		return h.handleRead(msg, writer)
	case models.MsgLogDelete:
		return h.handleDelete(msg, writer)
	case models.MsgLogDeleteAll:
		return h.handleDeleteAll(writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *LogHandler) handleList(writer ResponseWriter) error {
	logs, err := h.manager.ListLogs()
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogList,
		Data: logs,
	})
}

func (h *LogHandler) handleRead(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid read data: %w", err)
	}

	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse read request: %w", err)
	}

	content, err := h.manager.ReadLog(req.Filename)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogRead,
		Data: map[string]string{
			"filename": req.Filename,
			"content":  content,
		},
	})
}

func (h *LogHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid delete data: %w", err)
	}

	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse delete request: %w", err)
	}

	if err := h.manager.DeleteLog(req.Filename); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogDelete,
		Data: map[string]string{
			"filename": req.Filename,
		},
	})
}

func (h *LogHandler) handleDeleteAll(writer ResponseWriter) error {
	if err := h.manager.DeleteAllLogs(); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgLogDeleteAll,
		Data: map[string]string{
			"status": "success",
		},
	})
}
