package models

type TunnelConfig struct {
	LocalPort  int    `json:"local_port"`
	RemoteHost string `json:"remote_host"`
	RemotePort int    `json:"remote_port"`
}

type TunnelInfo struct {
	ID         string `json:"id"`
	LocalPort  int    `json:"local_port"`
	RemoteHost string `json:"remote_host"`
	RemotePort int    `json:"remote_port"`
	Status     string `json:"status"` // active, stopped, error
	Error      string `json:"error,omitempty"`
}

type CreateTunnelRequest struct {
	Config TunnelConfig `json:"config"`
}

type StopTunnelRequest struct {
	TunnelID string `json:"tunnel_id"`
}
