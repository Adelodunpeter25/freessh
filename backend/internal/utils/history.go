package utils

import (
	"freessh-backend/internal/models"
	"strings"
	"unicode"
)

// NormalizeHistoryCommand trims command text and removes non-printable control
// characters that can cause semantically identical commands to bypass duplicate checks.
// We preserve tabs/newlines and regular spacing to avoid altering command intent.
func NormalizeHistoryCommand(command string) string {
	trimmed := strings.TrimSpace(command)
	if trimmed == "" {
		return ""
	}

	var b strings.Builder
	b.Grow(len(trimmed))
	for _, r := range trimmed {
		if unicode.IsControl(r) && r != '\n' && r != '\t' {
			continue
		}
		b.WriteRune(r)
	}

	return strings.TrimSpace(b.String())
}

// ShouldAddToHistory checks if a command should be added to history
// Returns false if the command already exists in the provided recent entries.
func ShouldAddToHistory(command string, entries []models.HistoryEntry) bool {
	command = NormalizeHistoryCommand(command)
	if command == "" {
		return false
	}

	if len(entries) == 0 {
		return true
	}

	for _, entry := range entries {
		if NormalizeHistoryCommand(entry.Command) == command {
			return false
		}
	}

	return true
}
