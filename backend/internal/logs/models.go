package logs

import (
	"time"
)

type LogEntry struct {
	Filename       string    `json:"filename"`
	ConnectionName string    `json:"connection_name"`
	Timestamp      time.Time `json:"timestamp"`
	Size           int64     `json:"size"`
	Path           string    `json:"path"`
}
