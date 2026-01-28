package local

import (
	"fmt"
	"io"
	"net"

	"golang.org/x/crypto/ssh"
)

func NewTunnel(id string, localPort int, remoteHost string, remotePort int, sshClient *ssh.Client) *Tunnel {
	return &Tunnel{
		ID:         id,
		LocalPort:  localPort,
		RemoteHost: remoteHost,
		RemotePort: remotePort,
		Status:     "stopped",
		sshClient:  sshClient,
		stopChan:   make(chan struct{}),
	}
}

func (t *Tunnel) Start() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.Status == "active" {
		return fmt.Errorf("tunnel already active")
	}

	listener, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", t.LocalPort))
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

		localConn, err := t.listener.Accept()
		if err != nil {
			select {
			case <-t.stopChan:
				return
			default:
				continue
			}
		}

		go t.handleConnection(localConn)
	}
}

func (t *Tunnel) handleConnection(localConn net.Conn) {
	defer localConn.Close()

	remoteConn, err := t.sshClient.Dial("tcp", fmt.Sprintf("%s:%d", t.RemoteHost, t.RemotePort))
	if err != nil {
		return
	}
	defer remoteConn.Close()

	done := make(chan struct{}, 2)

	go func() {
		io.Copy(remoteConn, localConn)
		done <- struct{}{}
	}()

	go func() {
		io.Copy(localConn, remoteConn)
		done <- struct{}{}
	}()

	<-done
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
