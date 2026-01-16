package terminal

import (
	"fmt"
	"freessh-backend/internal/ssh"
	"sync"

	sshpkg "golang.org/x/crypto/ssh"
)

type Terminal struct {
	sshClient *ssh.Client
	session   *sshpkg.Session
	pty       *PTY
	shell     *Shell
	io        *IO
	mu        sync.Mutex
}

func NewTerminal(sshClient *ssh.Client) *Terminal {
	return &Terminal{
		sshClient: sshClient,
	}
}

func (t *Terminal) Initialize(rows, cols int) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	session, err := t.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	t.session = session

	io, err := NewIO(session)
	if err != nil {
		session.Close()
		return err
	}
	t.io = io

	t.pty = NewPTY(session)
	if err := t.pty.Request(rows, cols); err != nil {
		session.Close()
		return err
	}

	t.shell = NewShell(session)
	if err := t.shell.Start(); err != nil {
		session.Close()
		return err
	}

	return nil
}

func (t *Terminal) Write(data []byte) (int, error) {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.io.Write(data)
}

func (t *Terminal) GetIO() *IO {
	return t.io
}

func (t *Terminal) Resize(rows, cols int) error {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.pty.Resize(rows, cols)
}

func (t *Terminal) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.session != nil {
		return t.session.Close()
	}
	return nil
}
