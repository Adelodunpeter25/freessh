package terminal

import (
	"fmt"

	sshpkg "golang.org/x/crypto/ssh"
)

type Shell struct {
	session *sshpkg.Session
}

func NewShell(session *sshpkg.Session) *Shell {
	return &Shell{
		session: session,
	}
}

func (s *Shell) Start() error {
	if s.session == nil {
		return fmt.Errorf("no active session")
	}

	return s.session.Shell()
}
