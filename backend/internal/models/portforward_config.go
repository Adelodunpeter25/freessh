package models

type PortForwardConfig struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	ConnectionID   string `json:"connection_id"`
	Type           string `json:"type"` // "local" or "remote"
	LocalPort      int    `json:"local_port"`
	RemoteHost     string `json:"remote_host"`
	RemotePort     int    `json:"remote_port"`
	BindingAddress string `json:"binding_address"` // "localhost", "0.0.0.0", etc.
	AutoStart      bool   `json:"auto_start"`
}
