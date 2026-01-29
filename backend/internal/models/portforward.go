package models

type TunnelConfig struct {
	LocalPort      int    `json:"local_port"`
	RemoteHost     string `json:"remote_host"`
	RemotePort     int    `json:"remote_port"`
	BindingAddress string `json:"binding_address"`
}

type RemoteTunnelConfig struct {
	RemotePort     int    `json:"remote_port"`
	LocalHost      string `json:"local_host"`
	LocalPort      int    `json:"local_port"`
	BindingAddress string `json:"binding_address"`
}

type TunnelInfo struct {
	ID           string `json:"id"`
	ConnectionID string `json:"connection_id"`
	Name         string `json:"name"`
	Type         string `json:"type"` // "local" or "remote"
	LocalPort    int    `json:"local_port"`
	RemoteHost   string `json:"remote_host"`
	RemotePort   int    `json:"remote_port"`
	Status       string `json:"status"` // active, stopped, error
	Error        string `json:"error,omitempty"`
}

type CreateTunnelRequest struct {
	Type         string              `json:"type"` // "local" or "remote"
	ConnectionID string              `json:"connection_id"`
	Name         string              `json:"name"`
	Config       TunnelConfig        `json:"config,omitempty"`
	Remote       RemoteTunnelConfig  `json:"remote,omitempty"`
}

type StopTunnelRequest struct {
	ConnectionID string `json:"connection_id"`
	TunnelID     string `json:"tunnel_id"`
}
