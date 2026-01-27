package session

import (
	"fmt"
	"freessh-backend/internal/keychain"
	"freessh-backend/internal/models"
	"freessh-backend/internal/osdetect"
	"freessh-backend/internal/ssh"
	"freessh-backend/internal/storage"
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

	// Fetch credentials from keychain
	kc := keychain.New()
	if config.AuthMethod == models.AuthPassword {
		password, err := kc.Get(config.ID)
		if err != nil {
			session.Status = models.SessionError
			session.Error = "Password not found in keychain"
			return &session, fmt.Errorf("password not found in keychain")
		}
		config.Password = password
	} else if config.AuthMethod == models.AuthPublicKey {
		// Load private key from file if KeyID is set
		if config.KeyID != "" {
			fileStorage, err := storage.NewKeyFileStorage()
			if err != nil {
				session.Status = models.SessionError
				session.Error = "Failed to initialize key storage"
				return &session, fmt.Errorf("failed to initialize key storage: %w", err)
			}
			privateKey, err := fileStorage.GetPrivateKey(config.KeyID)
			if err != nil {
				session.Status = models.SessionError
				session.Error = "Failed to load private key"
				return &session, fmt.Errorf("failed to load private key: %w", err)
			}
			config.PrivateKey = privateKey
		}
		
		if config.PrivateKey != "" {
			passphrase, _ := kc.Get(config.ID + ":passphrase")
			config.Passphrase = passphrase
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
	osSession, err := sshClient.GetSSHClient().NewSession()
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
