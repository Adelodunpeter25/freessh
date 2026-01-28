package handlers

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"
	"time"
)

type HostKeyVerificationHelper struct {
	verificationChannels map[string]chan bool
	mu                   sync.Mutex
}

func NewHostKeyVerificationHelper() *HostKeyVerificationHelper {
	return &HostKeyVerificationHelper{
		verificationChannels: make(map[string]chan bool),
	}
}

func (h *HostKeyVerificationHelper) CreateVerificationCallback(writer ResponseWriter) func(*models.HostKeyVerification) error {
	return func(verification *models.HostKeyVerification) error {
		verifyKey := fmt.Sprintf("%s:%d", verification.Hostname, verification.Port)

		responseChan := make(chan bool, 1)
		h.mu.Lock()
		h.verificationChannels[verifyKey] = responseChan
		h.mu.Unlock()

		defer func() {
			h.mu.Lock()
			delete(h.verificationChannels, verifyKey)
			h.mu.Unlock()
		}()

		if err := writer.WriteMessage(&models.IPCMessage{
			Type: models.MsgHostKeyVerify,
			Data: verification,
		}); err != nil {
			return err
		}

		select {
		case trusted := <-responseChan:
			if !trusted {
				return fmt.Errorf("user rejected host key")
			}
			return nil
		case <-time.After(60 * time.Second):
			return fmt.Errorf("host key verification timeout")
		}
	}
}

func (h *HostKeyVerificationHelper) HandleVerifyResponse(msg *models.IPCMessage) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid verify response data")
	}

	hostname, _ := dataMap["hostname"].(string)
	port, _ := dataMap["port"].(float64)
	trusted, _ := dataMap["trusted"].(bool)

	verifyKey := fmt.Sprintf("%s:%d", hostname, int(port))

	h.mu.Lock()
	responseChan, exists := h.verificationChannels[verifyKey]
	h.mu.Unlock()

	if !exists {
		return fmt.Errorf("no pending verification for %s", verifyKey)
	}

	responseChan <- trusted
	return nil
}
