package dynamic

import (
	"fmt"
	"net"

	"golang.org/x/crypto/ssh"
)

func NewTunnel(id string, localPort int, bindingAddress string, sshClient *ssh.Client) *Tunnel {
	return &Tunnel{
		ID:             id,
		LocalPort:      localPort,
		BindingAddress: bindingAddress,
		Status:         "stopped",
		sshClient:      sshClient,
		stopChan:       make(chan struct{}),
	}
}

func (t *Tunnel) Start() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.Status == "active" {
		return fmt.Errorf("tunnel already active")
	}

	bindAddr := t.BindingAddress
	if bindAddr == "" {
		bindAddr = "localhost"
	}

	listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", bindAddr, t.LocalPort))
	if err != nil {
		t.Status = "error"
		t.Error = err.Error()
		return fmt.Errorf("failed to listen on port %d: %w", t.LocalPort, err)
	}

	t.listener = listener
	t.stopChan = make(chan struct{})
	t.Status = "active"
	t.Error = ""

	go t.acceptConnections()

	return nil
}

func (t *Tunnel) acceptConnections() {
	for {
		select {
		case <-t.stopChan:
			return
		default:
		}

		clientConn, err := t.listener.Accept()
		if err != nil {
			select {
			case <-t.stopChan:
				return
			default:
				continue
			}
		}

		go t.handleConnection(clientConn)
	}
}

func (t *Tunnel) handleConnection(clientConn net.Conn) {
	// Use SSH client's Dial function for SOCKS5 handler
	dialFunc := func(network, addr string) (net.Conn, error) {
		return t.sshClient.Dial(network, addr)
	}

	handleSOCKS5(clientConn, dialFunc)
}

func (t *Tunnel) Stop() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.Status != "active" {
		return nil
	}

	close(t.stopChan)

	if t.listener != nil {
		t.listener.Close()
	}

	t.Status = "stopped"
	return nil
}

func (t *Tunnel) IsActive() bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.Status == "active"
}
