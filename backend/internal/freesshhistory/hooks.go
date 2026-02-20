package freesshhistory

import "strings"

const ShellHistoryHookScriptBashZsh = `[ -n "$BASH_VERSION" ] && __freessh_emit_history(){ local line histno cmd; line="$(history 1 2>/dev/null)"; histno="$(printf '%s\n' "$line" | awk '{print $1}')"; cmd="$(printf '%s\n' "$line" | sed 's/^[[:space:]]*[0-9][0-9]*[[:space:]]*//')"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; PROMPT_COMMAND="__freessh_emit_history${PROMPT_COMMAND:+;$PROMPT_COMMAND}"; [ -n "$ZSH_VERSION" ] && autoload -Uz add-zsh-hook 2>/dev/null && __freessh_precmd(){ local histno cmd; histno="$HISTCMD"; cmd="$(fc -ln -1 2>/dev/null)"; if [ -n "$histno" ] && [ "$histno" != "${__FREESSH_LAST_HISTNO:-}" ]; then __FREESSH_LAST_HISTNO="$histno"; printf '\033]1337;freessh-history=%s\a' "$cmd"; fi; }; add-zsh-hook precmd __freessh_precmd 2>/dev/null || true`
const ShellHistoryHookScriptFish = `functions -q __freessh_emit_history; or function __freessh_emit_history --on-event fish_prompt; set -l cmd (history --max=1); if test -n "$cmd"; if test "$cmd" != "$__FREESSH_LAST_CMD"; set -g __FREESSH_LAST_CMD "$cmd"; printf '\e]1337;freessh-history=%s\a' "$cmd"; end; end; end`
const ShellHistoryHookScriptPowerShell = `if (-not $global:__FREESSH_LAST_HIST_ID) { $global:__FREESSH_LAST_HIST_ID = -1 }; if (-not (Get-EventSubscriber | Where-Object { $_.SourceIdentifier -eq 'freessh_history_hook' })) { Register-EngineEvent -SourceIdentifier 'freessh_history_hook' -SupportEvent -EventName PowerShell.OnIdle -Action { $h = Get-History -Count 1; if ($h -and $h.Id -ne $global:__FREESSH_LAST_HIST_ID) { $global:__FREESSH_LAST_HIST_ID = $h.Id; Write-Host -NoNewline (([char]27 + ']1337;freessh-history=' + $h.CommandLine + [char]7)) } } | Out-Null }`

func SelectHookScript(shellName, osType string) string {
	if strings.EqualFold(osType, "windows") {
		return ShellHistoryHookScriptPowerShell
	}

	shell := strings.ToLower(shellName)
	switch {
	case strings.Contains(shell, "fish"):
		return ShellHistoryHookScriptFish
	case strings.Contains(shell, "bash"), strings.Contains(shell, "zsh"):
		return ShellHistoryHookScriptBashZsh
	default:
		return ""
	}
}
