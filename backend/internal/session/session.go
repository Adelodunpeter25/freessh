package session

import (
	"freessh-backend/internal/localterminal"
	"freessh-backend/internal/models"
	"freessh-backend/internal/portforward"
	"freessh-backend/internal/sftp"
	"freessh-backend/internal/ssh"
	"freessh-backend/internal/terminal"
)

type ActiveSession struct {
	ID              string
	SSHClient       *ssh.Client
	Terminal        *terminal.Terminal
	LocalTerminal   *localterminal.Terminal
	SFTPClient      *sftp.Client
	PortForwardMgr  *portforward.Manager
	Session         models.Session
	OutputChan      chan []byte
	ErrorChan       chan error
	stopChan        chan struct{}
}

func NewActiveSession(id string, sshClient *ssh.Client, term *terminal.Terminal, session models.Session) *ActiveSession {
	return &ActiveSession{
		ID:             id,
		SSHClient:      sshClient,
		Terminal:       term,
		SFTPClient:     sftp.NewClient(sshClient),
		PortForwardMgr: portforward.NewManager(),
		Session:        session,
		OutputChan:     make(chan []byte, 500), // Increased from 100 to 500
		ErrorChan:      make(chan error, 10),
		stopChan:       make(chan struct{}),
	}
}

func NewLocalSession(id string, localTerm *localterminal.Terminal, session models.Session) *ActiveSession {
	return &ActiveSession{
		ID:            id,
		LocalTerminal: localTerm,
		Session:       session,
		OutputChan:    make(chan []byte, 500), // Increased from 100 to 500
		ErrorChan:     make(chan error, 10),
		stopChan:      make(chan struct{}),
	}
}

func (as *ActiveSession) Stop() {
	// Stop port forwarding first
	if as.PortForwardMgr != nil {
		as.PortForwardMgr.StopAll()
	}
	
	// Close channels
	select {
	case <-as.stopChan:
		// Already stopped
	default:
		close(as.stopChan)
	}
	
	close(as.OutputChan)
	close(as.ErrorChan)
}
