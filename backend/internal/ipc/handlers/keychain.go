package handlers

import (
	"fmt"
	"freessh-backend/internal/keychain"
	"freessh-backend/internal/models"
)

type KeychainHandler struct {
	keychain *keychain.Keychain
}

func NewKeychainHandler() *KeychainHandler {
	return &KeychainHandler{
		keychain: keychain.New(),
	}
}

func (h *KeychainHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKeychainSet, models.MsgKeychainGet, models.MsgKeychainDelete:
		return true
	}
	return false
}

func (h *KeychainHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgKeychainSet:
		return h.handleSet(msg, writer)
	case models.MsgKeychainGet:
		return h.handleGet(msg, writer)
	case models.MsgKeychainDelete:
		return h.handleDelete(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *KeychainHandler) handleSet(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	account, _ := dataMap["account"].(string)
	password, _ := dataMap["password"].(string)

	if account == "" || password == "" {
		return fmt.Errorf("account and password required")
	}

	if err := h.keychain.Set(account, password); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeychainSet,
		Data: map[string]string{"status": "stored"},
	})
}

func (h *KeychainHandler) handleGet(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	account, _ := dataMap["account"].(string)
	if account == "" {
		return fmt.Errorf("account required")
	}

	password, err := h.keychain.Get(account)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeychainGet,
		Data: map[string]string{"password": password},
	})
}

func (h *KeychainHandler) handleDelete(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	account, _ := dataMap["account"].(string)
	if account == "" {
		return fmt.Errorf("account required")
	}

	if err := h.keychain.Delete(account); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeychainDelete,
		Data: map[string]string{"status": "deleted"},
	})
}
