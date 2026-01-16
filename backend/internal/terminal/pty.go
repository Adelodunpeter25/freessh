package terminal

import (
	"fmt"

	sshpkg "golang.org/x/crypto/ssh"
)

type PTY struct {
	session *sshpkg.Session
}

func NewPTY(session *sshpkg.Session) *PTY {
	return &PTY{
		session: session,
	}
}

func (p *PTY) Request(rows, cols int) error {
	if p.session == nil {
		return fmt.Errorf("no active session")
	}

	modes := sshpkg.TerminalModes{
		sshpkg.ECHO:          1,
		sshpkg.TTY_OP_ISPEED: 14400,
		sshpkg.TTY_OP_OSPEED: 14400,
	}

	return p.session.RequestPty("xterm-256color", rows, cols, modes)
}

func (p *PTY) Resize(rows, cols int) error {
	if p.session == nil {
		return fmt.Errorf("no active session")
	}

	return p.session.WindowChange(rows, cols)
}
