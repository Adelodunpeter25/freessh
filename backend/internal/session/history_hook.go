package session

import "time"

const shellHistoryHookScript = `
if [ -n "$BASH_VERSION" ]; then
  __freessh_emit_history() {
    local line histno cmd
    line="$(history 1 2>/dev/null)"
    histno="$(printf '%s\n' "$line" | awk '{print $1}')"
    cmd="$(printf '%s\n' "$line" | sed 's/^[[:space:]]*[0-9][0-9]*[[:space:]]*//')"
    if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then
      __FREESSH_LAST_HISTNO="$histno"
      printf '\033]1337;freessh-history=%s\a' "$cmd"
    fi
  }
  if [ -n "$PROMPT_COMMAND" ]; then
    PROMPT_COMMAND="$PROMPT_COMMAND;__freessh_emit_history"
  else
    PROMPT_COMMAND="__freessh_emit_history"
  fi
fi

if [ -n "$ZSH_VERSION" ]; then
  autoload -Uz add-zsh-hook 2>/dev/null || true
  __freessh_precmd() {
    local histno cmd
    histno="$HISTCMD"
    cmd="$(fc -ln -1 2>/dev/null)"
    if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then
      __FREESSH_LAST_HISTNO="$histno"
      printf '\033]1337;freessh-history=%s\a' "$cmd"
    fi
  }
  add-zsh-hook precmd __freessh_precmd 2>/dev/null || true
fi
`

func (m *Manager) initShellHistoryHook(sessionID string) {
	go func() {
		// Wait briefly so interactive shell startup files complete first.
		time.Sleep(300 * time.Millisecond)
		_ = m.SendInput(sessionID, []byte(shellHistoryHookScript+"\n"))
	}()
}
