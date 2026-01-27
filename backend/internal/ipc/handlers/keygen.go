package handlers

import (
	"fmt"
	"freessh-backend/internal/keygen"
	"freessh-backend/internal/models"
)

type KeygenHandler struct{}

func NewKeygenHandler() *KeygenHandler {
	return &KeygenHandler{}
}

func (h *KeygenHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKeygenGenerate, models.MsgKeygenFingerprint:
		return true
	}
	return false
}

func (h *KeygenHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgKeygenGenerate:
		return h.handleGenerate(msg, writer)
	case models.MsgKeygenFingerprint:
		return h.handleFingerprint(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *KeygenHandler) handleGenerate(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	keyType, _ := dataMap["key_type"].(string)
	keySize, _ := dataMap["key_size"].(float64)
	comment, _ := dataMap["comment"].(string)
	passphrase, _ := dataMap["passphrase"].(string)

	if keyType == "" {
		keyType = "rsa"
	}
	if keySize == 0 {
		keySize = 4096
	}

	keyPair, err := keygen.GenerateKeyPair(keygen.KeyType(keyType), int(keySize), comment, passphrase)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeygenGenerate,
		Data: map[string]string{
			"private_key": keyPair.PrivateKey,
			"public_key":  keyPair.PublicKey,
			"fingerprint": keyPair.Fingerprint,
		},
	})
}

func (h *KeygenHandler) handleFingerprint(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	publicKey, _ := dataMap["public_key"].(string)
	if publicKey == "" {
		return fmt.Errorf("public_key required")
	}

	fingerprint, err := keygen.GetFingerprint(publicKey)
	if err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKeygenFingerprint,
		Data: map[string]string{"fingerprint": fingerprint},
	})
}
