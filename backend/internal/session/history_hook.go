package session

import (
	"strings"
)

const shellHistoryHookScriptBashZsh = `[ -n "$BASH_VERSION" ] && __freessh_emit_history(){ local line histno cmd; line="$(history 1 2>/dev/null)"; histno="$(printf '%s\n' "$line" | awk '{print $1}')"; cmd="$(printf '%s\n' "$line" | sed 's/^[[:space:]]*[0-9][0-9]*[[:space:]]*//')"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; PROMPT_COMMAND="__freessh_emit_history${PROMPT_COMMAND:+;$PROMPT_COMMAND}"; [ -n "$ZSH_VERSION" ] && autoload -Uz add-zsh-hook 2>/dev/null && __freessh_precmd(){ local histno cmd; histno="$HISTCMD"; cmd="$(fc -ln -1 2>/dev/null)"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; add-zsh-hook precmd __freessh_precmd 2>/dev/null || true`
const shellHistoryHookScriptFish = `functions -q __freessh_emit_history; or function __freessh_emit_history --on-event fish_prompt; set -l cmd (history --max=1); if test -n "$cmd"; if test "$cmd" != "$__FREESSH_LAST_CMD"; set -g __FREESSH_LAST_CMD "$cmd"; printf '\e]1337;freessh-history=%s\a' "$cmd"; end; end; end`
const shellHistoryHookScriptPowerShell = `if (-not $global:__FREESSH_LAST_HIST_ID) { $global:__FREESSH_LAST_HIST_ID = -1 }; if (-not (Get-EventSubscriber | Where-Object { $_.SourceIdentifier -eq 'freessh_history_hook' })) { Register-EngineEvent -SourceIdentifier 'freessh_history_hook' -SupportEvent -EventName PowerShell.OnIdle -Action { $h = Get-History -Count 1; if ($h -and $h.Id -ne $global:__FREESSH_LAST_HIST_ID) { $global:__FREESSH_LAST_HIST_ID = $h.Id; Write-Host -NoNewline (([char]27 + ']1337;freessh-history=' + $h.CommandLine + [char]7)) } } | Out-Null }`

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
	// Local terminals use backend input-based history capture to avoid shell bootstrap
	// injection races that can leak hook commands into the visible prompt.
	if as.LocalTerminal != nil {
		return ""
	}

	// Windows SSH sessions are typically PowerShell-based.
	if strings.EqualFold(as.Session.OSType, "windows") {
		return shellHistoryHookScriptPowerShell
	}

	shellName := strings.ToLower(m.detectRemoteShell(as))

	switch {
	case strings.Contains(shellName, "fish"):
		return shellHistoryHookScriptFish
	case strings.Contains(shellName, "bash"), strings.Contains(shellName, "zsh"):
		return shellHistoryHookScriptBashZsh
	default:
		// Explicitly no-op for plain sh and unknown shells.
		return ""
	}
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
