package localterminal

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
	"sync"

	"github.com/creack/pty"
)

type Terminal struct {
	cmd    *exec.Cmd
	ptmx   *os.File
	mu     sync.Mutex
	closed bool
}

func NewTerminal() *Terminal {
	return &Terminal{}
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
	t.ptmx = ptmx

	if err := pty.Setsize(ptmx, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	}); err != nil {
		ptmx.Close()
		return fmt.Errorf("failed to set pty size: %w", err)
	}

	return nil
}

func (t *Terminal) Write(data []byte) (int, error) {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.closed || t.ptmx == nil {
		return 0, fmt.Errorf("terminal closed")
	}

	return t.ptmx.Write(data)
}

func (t *Terminal) Read() io.Reader {
	return t.ptmx
}

func (t *Terminal) Resize(rows, cols int) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.ptmx == nil {
		return fmt.Errorf("terminal not initialized")
	}

	return pty.Setsize(t.ptmx, &pty.Winsize{
		Rows: uint16(rows),
		Cols: uint16(cols),
	})
}

func (t *Terminal) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.closed {
		return nil
	}

	t.closed = true

	if t.ptmx != nil {
		t.ptmx.Close()
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
