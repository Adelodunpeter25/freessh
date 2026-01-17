package session

import (
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
		OutputChan:     make(chan []byte, 100),
		ErrorChan:      make(chan error, 10),
		stopChan:       make(chan struct{}),
	}
}

func (as *ActiveSession) Stop() {
	as.PortForwardMgr.StopAll()
	close(as.stopChan)
	close(as.OutputChan)
	close(as.ErrorChan)
}
