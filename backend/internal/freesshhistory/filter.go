package freesshhistory

import "strings"

const MarkerPrefix = "\x1b]1337;freessh-history="

// ParseMarkers extracts freessh-history marker commands from a stream chunk.
// It returns parsed commands and a tail buffer to retain for the next chunk.
func ParseMarkers(chunk string) ([]string, string) {
	commands := make([]string, 0)
	buffer := chunk

	for {
		start := strings.Index(buffer, MarkerPrefix)
		if start == -1 {
			const keepTail = 128
			if len(buffer) > keepTail {
				buffer = buffer[len(buffer)-keepTail:]
			}
			return commands, buffer
		}

		end := strings.IndexByte(buffer[start+len(MarkerPrefix):], '\a')
		if end == -1 {
			return commands, buffer[start:]
		}

		end += start + len(MarkerPrefix)
		command := strings.TrimSpace(buffer[start+len(MarkerPrefix) : end])
		if command != "" {
			commands = append(commands, command)
		}

		buffer = buffer[end+1:]
	}
}

func IsBootstrapCommand(command string) bool {
	c := strings.TrimSpace(command)
	return strings.Contains(c, "__freessh_emit_history") ||
		strings.Contains(c, "__FREESSH_LAST_CMD") ||
		strings.Contains(c, "fish_prompt") ||
		strings.Contains(c, "__freessh_precmd") ||
		strings.Contains(c, "__FREESSH_LAST_HISTNO") ||
		strings.Contains(c, "__FREESSH_LAST_HIST_ID") ||
		strings.Contains(c, "freessh-history=") ||
		strings.Contains(c, "Register-EngineEvent") ||
		strings.Contains(c, "PowerShell.OnIdle") ||
		strings.Contains(c, "Get-EventSubscriber") ||
		strings.Contains(c, "Get-History") ||
		strings.Contains(c, "add-zsh-hook") ||
		strings.Contains(c, "autoload -Uz") ||
		strings.Contains(c, "PROMPT_COMMAND=") ||
		strings.Contains(c, "$BASH_VERSION") ||
		strings.Contains(c, "$ZSH_VERSION")
}

func ContainsBootstrapFragment(content string) bool {
	c := strings.TrimSpace(content)
	if c == "" {
		return false
	}

	fragments := []string{
		"__freessh_emit_history",
		"__freessh_precmd",
		"__FREESSH_LAST_HISTNO",
		"__FREESSH_LAST_CMD",
		"freessh-history=%s",
		"histno=\"$HISTCMD\"",
		"cmd=\"$(fc -ln -1",
		"add-zsh-hook precmd",
		"PROMPT_COMMAND=\"__freessh_emit_history",
		"[ -n \"$BASH_VERSION\" ]",
		"[ -n \"$ZSH_VERSION\" ]",
	}

	for _, fragment := range fragments {
		if strings.Contains(c, fragment) {
			return true
		}
	}

	return false
}

// StripMarkers removes freessh OSC marker payloads from terminal output.
func StripMarkers(content string) string {
	cleaned := content
	for {
		start := strings.Index(cleaned, MarkerPrefix)
		if start == -1 {
			break
		}
		end := strings.IndexByte(cleaned[start+len(MarkerPrefix):], '\a')
		if end == -1 {
			cleaned = cleaned[:start]
			break
		}
		end += start + len(MarkerPrefix)
		cleaned = cleaned[:start] + cleaned[end+1:]
	}
	return cleaned
}

func SanitizeLogContent(content string) string {
	// Remove marker payloads from content directly.
	cleaned := StripMarkers(content)

	lines := strings.Split(cleaned, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			filtered = append(filtered, line)
			continue
		}

		if IsBootstrapCommand(trimmed) {
			continue
		}
		filtered = append(filtered, line)
	}

	return strings.Join(filtered, "\n")
}
