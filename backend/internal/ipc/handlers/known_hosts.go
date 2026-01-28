package handlers

import (
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

type KnownHostsHandler struct {
	storage *storage.KnownHostStorage
}

func NewKnownHostsHandler(storage *storage.KnownHostStorage) *KnownHostsHandler {
	return &KnownHostsHandler{
		storage: storage,
	}
}

func (h *KnownHostsHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKnownHostList, models.MsgKnownHostRemove, models.MsgKnownHostTrust:
		return true
	}
	return false
}

func (h *KnownHostsHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgKnownHostList:
		return h.handleList(msg, writer)
	case models.MsgKnownHostRemove:
		return h.handleRemove(msg, writer)
	case models.MsgKnownHostTrust:
		return h.handleTrust(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *KnownHostsHandler) handleList(msg *models.IPCMessage, writer ResponseWriter) error {
	hosts := h.storage.GetAll()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostList,
		Data: hosts,
	})
}

func (h *KnownHostsHandler) handleRemove(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, _ := dataMap["id"].(string)
	if id == "" {
		return fmt.Errorf("id required")
	}

	if err := h.storage.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostRemove,
		Data: map[string]string{"status": "removed", "id": id},
	})
}

func (h *KnownHostsHandler) handleTrust(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	hostname, _ := dataMap["hostname"].(string)
	port, _ := dataMap["port"].(float64)
	fingerprint, _ := dataMap["fingerprint"].(string)
	keyType, _ := dataMap["keyType"].(string)
	publicKey, _ := dataMap["publicKey"].(string)

	if hostname == "" || port == 0 || fingerprint == "" {
		return fmt.Errorf("hostname, port, and fingerprint required")
	}

	host := &models.KnownHost{
		Hostname:    hostname,
		Port:        int(port),
		KeyType:     keyType,
		Fingerprint: fingerprint,
		PublicKey:   publicKey,
	}

	if err := h.storage.Add(host); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostTrust,
		Data: map[string]string{"status": "trusted", "hostname": hostname},
	})
}
