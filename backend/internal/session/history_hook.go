package session

import "time"

const shellHistoryHookScript = `
[ -n "$BASH_VERSION" ] && __freessh_emit_history(){ local line histno cmd; line="$(history 1 2>/dev/null)"; histno="$(printf '%s\n' "$line" | awk '{print $1}')"; cmd="$(printf '%s\n' "$line" | sed 's/^[[:space:]]*[0-9][0-9]*[[:space:]]*//')"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; PROMPT_COMMAND="__freessh_emit_history${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
[ -n "$ZSH_VERSION" ] && autoload -Uz add-zsh-hook 2>/dev/null && __freessh_precmd(){ local histno cmd; histno="$HISTCMD"; cmd="$(fc -ln -1 2>/dev/null)"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; add-zsh-hook precmd __freessh_precmd 2>/dev/null || true
`

func (m *Manager) initShellHistoryHook(sessionID string) {
	go func() {
		// Wait briefly so interactive shell startup files complete first.
		time.Sleep(300 * time.Millisecond)
		// Hide bootstrap commands from terminal by disabling echo while injecting.
		_ = m.SendInput(sessionID, []byte("stty -echo >/dev/null 2>&1\n"))
		_ = m.SendInput(sessionID, []byte(shellHistoryHookScript+"\n"))
		_ = m.SendInput(sessionID, []byte("stty echo >/dev/null 2>&1\n"))
	}()
}
