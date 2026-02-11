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
	return strings.Contains(command, "__freessh_emit_history") ||
		strings.Contains(command, "__freessh_precmd") ||
		strings.Contains(command, "add-zsh-hook precmd") ||
		strings.Contains(command, "freessh-history=") ||
		strings.Contains(command, `if [ -n "$BASH_VERSION" ]; then`) ||
		strings.Contains(command, `if [ -n "$ZSH_VERSION" ]; then`)
}

func SanitizeLogContent(content string) string {
	commands, _ := ParseMarkers(content)
	_ = commands // markers are removed by ParseMarkers stream slicing below

	// Remove marker payloads from content directly.
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

	lines := strings.Split(cleaned, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" && IsBootstrapCommand(trimmed) {
			continue
		}
		filtered = append(filtered, line)
	}

	return strings.Join(filtered, "\n")
}
