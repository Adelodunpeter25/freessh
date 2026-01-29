package portforward

import (
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/portforward/dynamic"
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

func (m *Manager) CreateLocalTunnel(connectionID, name string, config models.TunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := local.NewTunnel(id, config.LocalPort, config.RemoteHost, config.RemotePort, config.BindingAddress, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = &TunnelWrapper{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "local",
		LocalPort:    config.LocalPort,
		RemoteHost:   config.RemoteHost,
		RemotePort:   config.RemotePort,
		Tunnel:       tunnel,
	}

	return &models.TunnelInfo{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "local",
		LocalPort:    config.LocalPort,
		RemoteHost:   config.RemoteHost,
		RemotePort:   config.RemotePort,
		Status:       "active",
	}, nil
}

func (m *Manager) CreateRemoteTunnel(connectionID, name string, config models.RemoteTunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := remote.NewTunnel(id, config.RemotePort, config.LocalHost, config.LocalPort, config.BindingAddress, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = &TunnelWrapper{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "remote",
		LocalPort:    config.LocalPort,
		RemoteHost:   config.LocalHost,
		RemotePort:   config.RemotePort,
		Tunnel:       tunnel,
	}

	return &models.TunnelInfo{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "remote",
		LocalPort:    config.LocalPort,
		RemoteHost:   config.LocalHost,
		RemotePort:   config.RemotePort,
		Status:       "active",
	}, nil
}

func (m *Manager) CreateDynamicTunnel(connectionID, name string, config models.DynamicTunnelConfig, sshClient *ssh.Client) (*models.TunnelInfo, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id := uuid.New().String()
	tunnel := dynamic.NewTunnel(id, config.LocalPort, config.BindingAddress, sshClient)

	if err := tunnel.Start(); err != nil {
		return nil, err
	}

	m.tunnels[id] = &TunnelWrapper{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "dynamic",
		LocalPort:    config.LocalPort,
		RemoteHost:   "",
		RemotePort:   0,
		Tunnel:       tunnel,
	}

	return &models.TunnelInfo{
		ID:           id,
		ConnectionID: connectionID,
		Name:         name,
		Type:         "dynamic",
		LocalPort:    config.LocalPort,
		RemoteHost:   "",
		RemotePort:   0,
		Status:       "active",
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
			ID:           wrapper.ID,
			ConnectionID: wrapper.ConnectionID,
			Name:         wrapper.Name,
			Type:         wrapper.Type,
			LocalPort:    wrapper.LocalPort,
			RemoteHost:   wrapper.RemoteHost,
			RemotePort:   wrapper.RemotePort,
			Status:       status,
		})
	}

	return tunnels
}

func (m *Manager) ListTunnelsByConnection(connectionID string) []models.TunnelInfo {
	m.mu.RLock()
	defer m.mu.RUnlock()

	tunnels := make([]models.TunnelInfo, 0)
	for _, wrapper := range m.tunnels {
		if wrapper.ConnectionID != connectionID {
			continue
		}

		status := "stopped"
		if wrapper.Tunnel.IsActive() {
			status = "active"
		}

		tunnels = append(tunnels, models.TunnelInfo{
			ID:           wrapper.ID,
			ConnectionID: wrapper.ConnectionID,
			Name:         wrapper.Name,
			Type:         wrapper.Type,
			LocalPort:    wrapper.LocalPort,
			RemoteHost:   wrapper.RemoteHost,
			RemotePort:   wrapper.RemotePort,
			Status:       status,
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
