package terminal

import (
	"fmt"
	"strings"

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

func (p *PTY) Request(termType string, rows, cols int) error {
	if p.session == nil {
		return fmt.Errorf("no active session")
	}
	if strings.TrimSpace(termType) == "" {
		termType = "xterm-256color"
	}

	modes := sshpkg.TerminalModes{
		sshpkg.ECHO:          1,
		sshpkg.TTY_OP_ISPEED: 14400,
		sshpkg.TTY_OP_OSPEED: 14400,
	}

	return p.session.RequestPty(termType, rows, cols, modes)
}

func (p *PTY) Resize(rows, cols int) error {
	if p.session == nil {
		return fmt.Errorf("no active session")
	}

	return p.session.WindowChange(rows, cols)
}
