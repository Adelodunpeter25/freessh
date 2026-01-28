package remote

import (
	"net"
	"sync"

	"golang.org/x/crypto/ssh"
)

type Tunnel struct {
	ID         string
	RemotePort int
	LocalHost  string
	LocalPort  int
	Status     string
	Error      string

	sshClient *ssh.Client
	listener  net.Listener
	stopChan  chan struct{}
	mu        sync.Mutex
}
