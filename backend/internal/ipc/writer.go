package ipc

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"os"
	"sync"
)

type Writer struct {
	mu sync.Mutex
}

func NewWriter() *Writer {
	return &Writer{}
}

func (w *Writer) WriteMessage(msg *models.IPCMessage) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	data = append(data, '\n')
	
	if _, err := os.Stdout.Write(data); err != nil {
		return fmt.Errorf("failed to write to stdout: %w", err)
	}

	return nil
}

func (w *Writer) WriteError(sessionID string, err error) error {
	return w.WriteMessage(&models.IPCMessage{
		Type:      models.MsgError,
		SessionID: sessionID,
		Data:      map[string]string{"error": err.Error()},
	})
}
