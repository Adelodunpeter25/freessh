package localterminal

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"sync"

	"github.com/creack/pty"
)

type Terminal struct {
	cmd    *exec.Cmd
	pty    *PTY
	io     *IO
	mu     sync.Mutex
	closed bool
}

func NewTerminal() *Terminal {
	return &Terminal{
		pty: NewPTY(),
	}
}

func (t *Terminal) Initialize(rows, cols int) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	shell := getShell()
	t.cmd = exec.Command(shell)
	t.cmd.Env = os.Environ()

	ptmx, err := pty.Start(t.cmd)
	if err != nil {
		return fmt.Errorf("failed to start pty: %w", err)
	}

	t.pty.SetFile(ptmx)
	t.io = NewIO(ptmx)

	if err := t.pty.SetSize(rows, cols); err != nil {
		ptmx.Close()
		return fmt.Errorf("failed to set pty size: %w", err)
	}

	return nil
}

func (t *Terminal) Write(data []byte) (int, error) {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.closed || t.io == nil {
		return 0, fmt.Errorf("terminal closed")
	}

	return t.io.Write(data)
}

func (t *Terminal) Read() *IO {
	return t.io
}

func (t *Terminal) Resize(rows, cols int) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.pty == nil {
		return fmt.Errorf("terminal not initialized")
	}

	return t.pty.SetSize(rows, cols)
}

func (t *Terminal) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.closed {
		return nil
	}

	t.closed = true

	if t.pty != nil {
		t.pty.Close()
	}

	if t.cmd != nil && t.cmd.Process != nil {
		t.cmd.Process.Kill()
	}

	return nil
}

func getShell() string {
	if runtime.GOOS == "windows" {
		if powershell := os.Getenv("COMSPEC"); powershell != "" {
			return powershell
		}
		return "cmd.exe"
	}

	if shell := os.Getenv("SHELL"); shell != "" {
		return shell
	}

	return "/bin/sh"
}
