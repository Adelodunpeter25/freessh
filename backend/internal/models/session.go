package models

import "time"

type SessionStatus string

const (
	SessionConnecting    SessionStatus = "connecting"
	SessionConnected     SessionStatus = "connected"
	SessionDisconnected  SessionStatus = "disconnected"
	SessionError         SessionStatus = "error"
)

type Session struct {
	ID           string        `json:"id"`
	ConnectionID string        `json:"connection_id"`
	Status       SessionStatus `json:"status"`
	ConnectedAt  time.Time     `json:"connected_at,omitempty"`
	Error        string        `json:"error,omitempty"`
}
