package session

import (
	"fmt"
	"freessh-backend/internal/keychain"
	"freessh-backend/internal/localterminal"
	"freessh-backend/internal/models"
	"freessh-backend/internal/osdetect"
	"freessh-backend/internal/ssh"
	"freessh-backend/internal/storage"
	"freessh-backend/internal/terminal"
	"os"
	"runtime"
	"time"

	"github.com/google/uuid"
)

func (m *Manager) CreateSession(config models.ConnectionConfig) (*models.Session, error) {
	return m.CreateSessionWithVerification(config, nil)
}

func (m *Manager) CreateSessionWithVerification(config models.ConnectionConfig, verificationCallback func(*models.HostKeyVerification) error) (*models.Session, error) {
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
		// Load private key from file if KeyID is set (for generated keys)
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
		
		// Get passphrase from keychain if key is encrypted
		if config.PrivateKey != "" {
			passphrase, _ := kc.Get(config.ID + ":passphrase")
			config.Passphrase = passphrase
		}
	}

	// Initialize host key verification
	knownHostStorage, err := storage.NewKnownHostStorage()
	if err != nil {
		session.Status = models.SessionError
		session.Error = "Failed to initialize known hosts storage"
		return &session, fmt.Errorf("failed to initialize known hosts storage: %w", err)
	}

	verifier := ssh.NewHostKeyVerifier(knownHostStorage)
	
	sshClient := ssh.NewClient(config)
	
	// Set up host key verification callback
	callback := verifier.CreateCallback(config.Host, config.Port, func(verification *models.HostKeyVerification) error {
		// If verification callback provided, use it
		if verificationCallback != nil {
			return verificationCallback(verification)
		}
		
		// Otherwise auto-trust new hosts
		if verification.Status == "new" {
			return nil
		}
		return fmt.Errorf("host key verification failed")
	})
	sshClient.SetHostKeyCallback(callback)
	
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
	session.Type = models.SessionTypeSSH

	activeSession := NewActiveSession(sessionID, sshClient, term, session)
	activeSession.Config = config
	m.AddSession(activeSession)

	go m.readOutput(activeSession)

	// Auto-start logging if enabled
	if m.logSettings != nil && m.logSettings.GetAutoLogging() {
		m.StartLogging(sessionID)
	}

	return &session, nil
}

func (m *Manager) CreateLocalSession() (*models.Session, error) {
	sessionID := uuid.New().String()

	session := models.Session{
		ID:           sessionID,
		ConnectionID: "local",
		Type:         models.SessionTypeLocal,
		Status:       models.SessionConnecting,
	}

	localTerm := localterminal.NewTerminal()
	if err := localTerm.Initialize(24, 80); err != nil {
		session.Status = models.SessionError
		session.Error = err.Error()
		return &session, err
	}

	// Detect OS type
	osType := runtime.GOOS
	session.OSType = osType
	session.Status = models.SessionConnected
	session.ConnectedAt = time.Now()

	activeSession := NewLocalSession(sessionID, localTerm, session)
	// Set config for logging with hostname or "Local Terminal"
	hostname, _ := os.Hostname()
	if hostname == "" {
		hostname = "Local-Terminal"
	}
	activeSession.Config = models.ConnectionConfig{
		Name: hostname,
	}
	m.AddSession(activeSession)

	go m.readLocalOutput(activeSession)

	// Auto-start logging if enabled
	if m.logSettings != nil && m.logSettings.GetAutoLogging() {
		m.StartLogging(sessionID)
	}

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
