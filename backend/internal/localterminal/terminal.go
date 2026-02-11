package localterminal

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

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
	t.cmd.Env = buildTerminalEnv(shell)

	// Set working directory to user's home directory
	if homeDir, err := os.UserHomeDir(); err == nil {
		t.cmd.Dir = homeDir
	}

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
		// Try graceful shutdown first
		t.cmd.Process.Signal(os.Interrupt)

		// Wait for process to exit (with timeout)
		done := make(chan error, 1)
		go func() {
			done <- t.cmd.Wait()
		}()

		select {
		case <-done:
			// Process exited gracefully
		case <-time.After(2 * time.Second):
			// Timeout - force kill
			t.cmd.Process.Kill()
			t.cmd.Wait() // Reap zombie
		}
	}

	return nil
}

func getShell() string {
	if runtime.GOOS == "windows" {
		for _, candidate := range []string{"pwsh.exe", "powershell.exe"} {
			if p, err := exec.LookPath(candidate); err == nil {
				return p
			}
		}

		if comspec := os.Getenv("COMSPEC"); comspec != "" {
			return comspec
		}
		if p, err := exec.LookPath("cmd.exe"); err == nil {
			return p
		}
		return "cmd.exe"
	}

	candidates := []string{
		strings.TrimSpace(os.Getenv("SHELL")),
		strings.TrimSpace(detectLoginShellFromPasswd()),
	}

	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}
		if resolved := resolveExecutable(candidate); resolved != "" {
			return resolved
		}
	}

	// Last-resort portable fallback.
	if p, err := exec.LookPath("sh"); err == nil {
		return p
	}
	return "/bin/sh"
}

func buildTerminalEnv(shell string) []string {
	env := make(map[string]string)
	for _, pair := range os.Environ() {
		parts := strings.SplitN(pair, "=", 2)
		key := parts[0]
		value := ""
		if len(parts) == 2 {
			value = parts[1]
		}
		env[key] = value
	}

	if runtime.GOOS != "windows" {
		if strings.TrimSpace(env["SHELL"]) == "" && shell != "" {
			env["SHELL"] = shell
		}
		if strings.TrimSpace(env["TERM"]) == "" {
			// xterm.js behaves closest to xterm-256color.
			env["TERM"] = "xterm-256color"
		}
		if strings.TrimSpace(env["COLORTERM"]) == "" {
			env["COLORTERM"] = "truecolor"
		}
	}

	result := make([]string, 0, len(env))
	for key, value := range env {
		result = append(result, key+"="+value)
	}
	return result
}

func resolveExecutable(candidate string) string {
	candidate = strings.TrimSpace(candidate)
	if candidate == "" {
		return ""
	}

	if filepath.IsAbs(candidate) {
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			return candidate
		}
		return ""
	}

	if resolved, err := exec.LookPath(candidate); err == nil {
		return resolved
	}

	return ""
}

func detectLoginShellFromPasswd() string {
	currentUser, err := user.Current()
	if err != nil {
		return ""
	}

	passwd, err := os.Open("/etc/passwd")
	if err != nil {
		return ""
	}
	defer passwd.Close()

	scanner := bufio.NewScanner(passwd)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		fields := strings.Split(line, ":")
		if len(fields) < 7 {
			continue
		}

		username := fields[0]
		uid := fields[2]
		if username == currentUser.Username || uid == currentUser.Uid {
			return strings.TrimSpace(fields[6])
		}
	}

	return ""
}
