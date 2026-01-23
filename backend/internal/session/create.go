package session

import (
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/osdetect"
	"freessh-backend/internal/ssh"
	"freessh-backend/internal/terminal"
	"time"

	"github.com/google/uuid"
)

func (m *Manager) CreateSession(config models.ConnectionConfig) (*models.Session, error) {
	sessionID := uuid.New().String()
	
	session := models.Session{
		ID:           sessionID,
		ConnectionID: config.ID,
		Status:       models.SessionConnecting,
	}

	if m.storage != nil {
		existing, err := m.storage.Get(config.ID)
		if err != nil || existing == nil {
			if err := m.storage.Save(config); err != nil {
				return nil, fmt.Errorf("failed to save connection: %w", err)
			}
		}
	}

	sshClient := ssh.NewClient(config)
	
	if err := sshClient.Connect(); err != nil {
		session.Status = models.SessionError
		session.Error = err.Error()
		return &session, err
	}

	term := terminal.NewTerminal(sshClient)
	if err := term.Initialize(24, 80); err != nil {
		sshClient.Disconnect()
		session.Status = models.SessionError
		session.Error = err.Error()
		return &session, err
	}

	// Detect OS type
	osSession, err := sshClient.GetClient().NewSession()
	if err == nil {
		osType, _ := osdetect.DetectOS(osSession)
		session.OSType = string(osType)
		osSession.Close()
	}

	session.Status = models.SessionConnected
	session.ConnectedAt = time.Now()

	activeSession := NewActiveSession(sessionID, sshClient, term, session)
	m.AddSession(activeSession)

	go m.readOutput(activeSession)

	return &session, nil
}

func (m *Manager) CreateSessionFromSaved(connectionID string) (*models.Session, error) {
	if m.storage == nil {
		return nil, fmt.Errorf("storage not available")
	}

	config, err := m.storage.Get(connectionID)
	if err != nil {
		return nil, err
	}

	return m.CreateSession(*config)
}
