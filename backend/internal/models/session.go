package models

import "time"

type SessionStatus string
type SessionType string

const (
	SessionConnecting    SessionStatus = "connecting"
	SessionConnected     SessionStatus = "connected"
	SessionDisconnected  SessionStatus = "disconnected"
	SessionError         SessionStatus = "error"
	
	SessionTypeSSH   SessionType = "ssh"
	SessionTypeLocal SessionType = "local"
)

type Session struct {
	ID           string        `json:"id"`
	ConnectionID string        `json:"connection_id"`
	Type         SessionType   `json:"type"`
	Status       SessionStatus `json:"status"`
	ConnectedAt  time.Time     `json:"connected_at,omitempty"`
	Error        string        `json:"error,omitempty"`
	OSType       string        `json:"os_type,omitempty"`
}
