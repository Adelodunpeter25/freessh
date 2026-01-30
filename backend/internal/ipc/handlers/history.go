package handlers

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/history"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type HistoryHandler struct {
	manager *history.Manager
}

func NewHistoryHandler(historyStorage *storage.HistoryStorage) *HistoryHandler {
	return &HistoryHandler{
		manager: history.NewManager(historyStorage),
	}
}

func (h *HistoryHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgHistoryList, models.MsgHistoryAdd, models.MsgHistoryClear:
		return true
	}
	return false
}

func (h *HistoryHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgHistoryList:
		return h.handleList(writer)
	case models.MsgHistoryAdd:
		return h.handleAdd(msg, writer)
	case models.MsgHistoryClear:
		return h.handleClear(writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *HistoryHandler) handleList(writer ResponseWriter) error {
	entries, err := h.manager.List()
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgHistoryList,
		Data: models.HistoryListResponse{
			Entries: entries,
		},
	})
}

func (h *HistoryHandler) handleAdd(msg *models.IPCMessage, writer ResponseWriter) error {
	jsonData, err := json.Marshal(msg.Data)
	if err != nil {
		return fmt.Errorf("invalid data: %w", err)
	}

	var req models.HistoryAddRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		return fmt.Errorf("failed to parse request: %w", err)
	}

	entry, err := h.manager.Add(req.Command)
	if err != nil {
		return err
	}

	if entry == nil {
		return writer.WriteMessage(&models.IPCMessage{
			Type: models.MsgHistoryAdd,
			Data: models.HistoryAddResponse{},
		})
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgHistoryAdd,
		Data: models.HistoryAddResponse{
			Entry: *entry,
		},
	})
}

func (h *HistoryHandler) handleClear(writer ResponseWriter) error {
	if err := h.manager.Clear(); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgHistoryClear,
		Data: models.HistoryClearResponse{
			Status: "cleared",
		},
	})
}
