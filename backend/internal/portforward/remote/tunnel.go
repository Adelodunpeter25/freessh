package remote

import (
	"fmt"
	"io"
	"net"

	"golang.org/x/crypto/ssh"
)

func NewTunnel(id string, remotePort int, localHost string, localPort int, sshClient *ssh.Client) *Tunnel {
	return &Tunnel{
		ID:         id,
		RemotePort: remotePort,
		LocalHost:  localHost,
		LocalPort:  localPort,
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

	listener, err := t.sshClient.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", t.RemotePort))
	if err != nil {
		t.Status = "error"
		t.Error = err.Error()
		return fmt.Errorf("failed to listen on remote port %d: %w", t.RemotePort, err)
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

		remoteConn, err := t.listener.Accept()
		if err != nil {
			select {
			case <-t.stopChan:
				return
			default:
				continue
			}
		}

		go t.handleConnection(remoteConn)
	}
}

func (t *Tunnel) handleConnection(remoteConn net.Conn) {
	defer remoteConn.Close()

	localConn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", t.LocalHost, t.LocalPort))
	if err != nil {
		return
	}
	defer localConn.Close()

	done := make(chan struct{}, 2)

	go func() {
		io.Copy(localConn, remoteConn)
		done <- struct{}{}
	}()

	go func() {
		io.Copy(remoteConn, localConn)
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
