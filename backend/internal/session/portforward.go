package session

import "freessh-backend/internal/models"

func (m *Manager) CreateLocalTunnel(sessionID, connectionID, name string, config models.TunnelConfig) (*models.TunnelInfo, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	return session.PortForwardMgr.CreateLocalTunnel(connectionID, name, config, session.SSHClient.GetSSHClient())
}

func (m *Manager) CreateRemoteTunnel(sessionID, connectionID, name string, config models.RemoteTunnelConfig) (*models.TunnelInfo, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	return session.PortForwardMgr.CreateRemoteTunnel(connectionID, name, config, session.SSHClient.GetSSHClient())
}

func (m *Manager) CreateDynamicTunnel(sessionID, connectionID, name string, config models.DynamicTunnelConfig) (*models.TunnelInfo, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	return session.PortForwardMgr.CreateDynamicTunnel(connectionID, name, config, session.SSHClient.GetSSHClient())
}

func (m *Manager) StopTunnel(sessionID, tunnelID string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	return session.PortForwardMgr.StopTunnel(tunnelID)
}

func (m *Manager) ListTunnels(sessionID string) []models.TunnelInfo {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return []models.TunnelInfo{}
	}

	return session.PortForwardMgr.ListTunnels()
}

func (m *Manager) ListTunnelsByConnection(sessionID, connectionID string) []models.TunnelInfo {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return []models.TunnelInfo{}
	}

	return session.PortForwardMgr.ListTunnelsByConnection(connectionID)
}
