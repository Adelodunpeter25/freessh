package session

import (
	"fmt"
	"freessh-backend/internal/models"
)

func (m *Manager) CloseSession(sessionID string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return fmt.Errorf("session not found: %s", sessionID)
	}

	session.Stop()
	
	if session.SFTPClient != nil {
		session.SFTPClient.Close()
	}
	
	if session.Terminal != nil {
		session.Terminal.Close()
	}
	
	if session.SSHClient != nil {
		session.SSHClient.Disconnect()
	}
	
	session.Session.Status = models.SessionDisconnected
	m.RemoveSession(sessionID)

	return nil
}
