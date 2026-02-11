package ipc

import (
	"bufio"
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"os"
)

type Reader struct {
	scanner *bufio.Scanner
}

func NewReader() *Reader {
	scanner := bufio.NewScanner(os.Stdin)
	// Allow larger IPC payloads (default scanner token limit is 64KB).
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)

	return &Reader{
		scanner: scanner,
	}
}

func (r *Reader) ReadMessage() (*models.IPCMessage, error) {
	if !r.scanner.Scan() {
		if err := r.scanner.Err(); err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("stdin closed")
	}

	line := r.scanner.Bytes()
	var msg models.IPCMessage

	if err := json.Unmarshal(line, &msg); err != nil {
		return nil, fmt.Errorf("invalid JSON: %w", err)
	}

	return &msg, nil
}
