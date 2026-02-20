package session

import (
	"freessh-backend/internal/freesshhistory"
	"strings"
)

func (m *Manager) initShellHistoryHook(sessionID string) {
	activeSession, err := m.GetSession(sessionID)
	if err != nil {
		return
	}

	script := m.selectHistoryHookScript(activeSession)
	if script == "" {
		return
	}

	// Inject immediately after session creation so it runs before frontend output
	// streaming is attached.
	_ = m.SendInput(sessionID, []byte(script+"\n"))
}

func (m *Manager) selectHistoryHookScript(as *ActiveSession) string {
	// Local terminals install hooks via shell startup config in localterminal.
	if as.LocalTerminal != nil {
		return ""
	}

	shellName := strings.ToLower(m.detectRemoteShell(as))
	return freesshhistory.SelectHookScript(shellName, as.Session.OSType)
}

func (m *Manager) detectRemoteShell(as *ActiveSession) string {
	if as == nil || as.SSHClient == nil {
		return ""
	}

	sshSession, err := as.SSHClient.GetSSHClient().NewSession()
	if err != nil {
		return ""
	}
	defer sshSession.Close()

	output, err := sshSession.Output(`printf '%s' "$SHELL"`)
	if err != nil {
		return ""
	}

	return strings.TrimSpace(string(output))
}
