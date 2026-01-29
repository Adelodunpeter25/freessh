package local

import (
	"net"
	"sync"

	"golang.org/x/crypto/ssh"
)

type Tunnel struct {
	ID             string
	LocalPort      int
	RemoteHost     string
	RemotePort     int
	BindingAddress string
	Status         string
	Error          string

	listener  net.Listener
	sshClient *ssh.Client
	stopChan  chan struct{}
	mu        sync.Mutex
}
