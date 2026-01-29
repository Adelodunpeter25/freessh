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

	// Stop session goroutines first
	session.Stop()
	
	// Stop logging if active
	if session.isLogging {
		m.StopLogging(sessionID)
	}
	
	// Close SFTP client
	if session.SFTPClient != nil {
		session.SFTPClient.Close()
	}
	
	// Close terminal
	if session.Terminal != nil {
		session.Terminal.Close()
	}
	
	// Disconnect SSH (this stops keep-alive)
	if session.SSHClient != nil {
		session.SSHClient.Disconnect()
	}
	
	// Update status and remove
	session.Session.Status = models.SessionDisconnected
	m.RemoveSession(sessionID)

	return nil
}
