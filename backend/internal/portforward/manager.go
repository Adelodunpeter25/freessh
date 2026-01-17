package portforward

import (
	"fmt"
	"freessh-backend/internal/models"
	"sync"

	"github.com/google/uuid"
	"golang.org/x/crypto/ssh"
)

type Manager struct {
	tunnels map[string]*Tunnel
	mu      sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		tunnels: make(map[string]*Tunnel),
	}
}

func (m *Manager) CreateTunnel(config models.TunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := NewTunnel(id, config.LocalPort, config.RemoteHost, config.RemotePort, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = tunnel

	return &models.TunnelInfo{
		ID:         tunnel.ID,
		LocalPort:  tunnel.LocalPort,
		RemoteHost: tunnel.RemoteHost,
		RemotePort: tunnel.RemotePort,
		Status:     tunnel.Status,
	}, nil
}

func (m *Manager) StopTunnel(tunnelID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	tunnel, exists := m.tunnels[tunnelID]
	if !exists {
		return fmt.Errorf("tunnel not found")
	}

	if err := tunnel.Stop(); err != nil {
		return err
	}

	delete(m.tunnels, tunnelID)
	return nil
}

func (m *Manager) ListTunnels() []models.TunnelInfo {
	m.mu.RLock()
	defer m.mu.RUnlock()

	tunnels := make([]models.TunnelInfo, 0, len(m.tunnels))
	for _, tunnel := range m.tunnels {
		tunnels = append(tunnels, models.TunnelInfo{
			ID:         tunnel.ID,
			LocalPort:  tunnel.LocalPort,
			RemoteHost: tunnel.RemoteHost,
			RemotePort: tunnel.RemotePort,
			Status:     tunnel.Status,
			Error:      tunnel.Error,
		})
	}

	return tunnels
}

func (m *Manager) StopAll() {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, tunnel := range m.tunnels {
		tunnel.Stop()
	}

	m.tunnels = make(map[string]*Tunnel)
}
