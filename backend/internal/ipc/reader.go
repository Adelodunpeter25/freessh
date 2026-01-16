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
	return &Reader{
		scanner: bufio.NewScanner(os.Stdin),
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
