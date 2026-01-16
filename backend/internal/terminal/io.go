package terminal

import (
	"fmt"
	"io"

	sshpkg "golang.org/x/crypto/ssh"
)

type IO struct {
	stdin  io.WriteCloser
	stdout io.Reader
	stderr io.Reader
}

func NewIO(session *sshpkg.Session) (*IO, error) {
	stdin, err := session.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get stdin: %w", err)
	}

	stdout, err := session.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get stdout: %w", err)
	}

	stderr, err := session.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get stderr: %w", err)
	}

	return &IO{
		stdin:  stdin,
		stdout: stdout,
		stderr: stderr,
	}, nil
}

func (io *IO) Write(data []byte) (int, error) {
	if io.stdin == nil {
		return 0, fmt.Errorf("stdin not available")
	}
	return io.stdin.Write(data)
}

func (io *IO) GetStdout() io.Reader {
	return io.stdout
}

func (io *IO) GetStderr() io.Reader {
	return io.stderr
}

func (io *IO) Close() error {
	if io.stdin != nil {
		return io.stdin.Close()
	}
	return nil
}
