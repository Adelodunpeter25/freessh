package portforward

import (
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/portforward/local"
	"freessh-backend/internal/portforward/remote"
	"sync"

	"github.com/google/uuid"
	"golang.org/x/crypto/ssh"
)

type Manager struct {
	tunnels map[string]*TunnelWrapper
	mu      sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		tunnels: make(map[string]*TunnelWrapper),
	}
}

func (m *Manager) CreateLocalTunnel(config models.TunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := local.NewTunnel(id, config.LocalPort, config.RemoteHost, config.RemotePort, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = &TunnelWrapper{
		ID:         id,
		Type:       "local",
		LocalPort:  config.LocalPort,
		RemoteHost: config.RemoteHost,
		RemotePort: config.RemotePort,
		Tunnel:     tunnel,
	}

	return &models.TunnelInfo{
		ID:         id,
		Type:       "local",
		LocalPort:  config.LocalPort,
		RemoteHost: config.RemoteHost,
		RemotePort: config.RemotePort,
		Status:     "active",
	}, nil
}

func (m *Manager) CreateRemoteTunnel(config models.RemoteTunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := remote.NewTunnel(id, config.RemotePort, config.LocalHost, config.LocalPort, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = &TunnelWrapper{
		ID:         id,
		Type:       "remote",
		LocalPort:  config.LocalPort,
		RemoteHost: config.LocalHost,
		RemotePort: config.RemotePort,
		Tunnel:     tunnel,
	}

	return &models.TunnelInfo{
		ID:         id,
		Type:       "remote",
		LocalPort:  config.LocalPort,
		RemoteHost: config.LocalHost,
		RemotePort: config.RemotePort,
		Status:     "active",
	}, nil
}

func (m *Manager) StopTunnel(tunnelID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	wrapper, exists := m.tunnels[tunnelID]
	if !exists {
		return fmt.Errorf("tunnel not found")
	}

	if err := wrapper.Tunnel.Stop(); err != nil {
		return err
	}

	delete(m.tunnels, tunnelID)
	return nil
}

func (m *Manager) ListTunnels() []models.TunnelInfo {
	m.mu.RLock()
	defer m.mu.RUnlock()

	tunnels := make([]models.TunnelInfo, 0, len(m.tunnels))
	for _, wrapper := range m.tunnels {
		status := "stopped"
		if wrapper.Tunnel.IsActive() {
			status = "active"
		}

		tunnels = append(tunnels, models.TunnelInfo{
			ID:         wrapper.ID,
			Type:       wrapper.Type,
			LocalPort:  wrapper.LocalPort,
			RemoteHost: wrapper.RemoteHost,
			RemotePort: wrapper.RemotePort,
			Status:     status,
		})
	}

	return tunnels
}

func (m *Manager) StopAll() {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, wrapper := range m.tunnels {
		wrapper.Tunnel.Stop()
	}

	m.tunnels = make(map[string]*TunnelWrapper)
}
