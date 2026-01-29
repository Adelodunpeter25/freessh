package portforward

type Tunnel interface {
	Start() error
	Stop() error
	IsActive() bool
}

type TunnelWrapper struct {
	ID           string
	ConnectionID string
	Name         string
	Type         string // "local" or "remote"
	LocalPort    int
	RemoteHost   string
	RemotePort   int
	Tunnel       Tunnel
}
