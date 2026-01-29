package session

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
)

func (m *Manager) AutoStartPortForwards(sessionID, connectionID string) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return
	}

	// Load port forward storage
	pfStorage, err := storage.NewPortForwardStorage()
	if err != nil {
		return
	}

	// Get configs for this connection with auto_start enabled
	configs := pfStorage.GetByConnection(connectionID)
	
	for _, config := range configs {
		if !config.AutoStart {
			continue
		}

		// Start tunnel based on type
		if config.Type == "local" {
			tunnelConfig := models.TunnelConfig{
				LocalPort:      config.LocalPort,
				RemoteHost:     config.RemoteHost,
				RemotePort:     config.RemotePort,
				BindingAddress: config.BindingAddress,
			}
			session.PortForwardMgr.CreateLocalTunnel(connectionID, config.Name, tunnelConfig, session.SSHClient.GetSSHClient())
		} else if config.Type == "remote" {
			tunnelConfig := models.RemoteTunnelConfig{
				RemotePort:     config.RemotePort,
				LocalHost:      config.RemoteHost,
				LocalPort:      config.LocalPort,
				BindingAddress: config.BindingAddress,
			}
			session.PortForwardMgr.CreateRemoteTunnel(connectionID, config.Name, tunnelConfig, session.SSHClient.GetSSHClient())
		} else if config.Type == "dynamic" {
			tunnelConfig := models.DynamicTunnelConfig{
				LocalPort:      config.LocalPort,
				BindingAddress: config.BindingAddress,
			}
			session.PortForwardMgr.CreateDynamicTunnel(connectionID, config.Name, tunnelConfig, session.SSHClient.GetSSHClient())
		}
	}
}
