package models

import "strings"

// SessionProfile stores per-connection terminal defaults.
// Backend actively applies TERM and startup command.
type SessionProfile struct {
	Term                  string `json:"term,omitempty"`
	FontSize              int    `json:"font_size,omitempty"`
	StartupCommand        string `json:"startup_command,omitempty"`
	StartupCommandDelayMs int    `json:"startup_command_delay_ms,omitempty"`
	TerminalTheme         string `json:"terminal_theme,omitempty"`
}

func NormalizeSessionProfile(profile *SessionProfile) *SessionProfile {
	if profile == nil {
		return nil
	}

	normalized := *profile

	normalized.Term = strings.TrimSpace(normalized.Term)
	if len(normalized.Term) > 128 {
		normalized.Term = normalized.Term[:128]
	}

	normalized.StartupCommand = strings.TrimSpace(normalized.StartupCommand)
	if len(normalized.StartupCommand) > 4096 {
		normalized.StartupCommand = normalized.StartupCommand[:4096]
	}

	if normalized.FontSize < 0 {
		normalized.FontSize = 0
	}
	if normalized.StartupCommandDelayMs < 0 {
		normalized.StartupCommandDelayMs = 0
	}
	if normalized.StartupCommandDelayMs > 60000 {
		normalized.StartupCommandDelayMs = 60000
	}

	normalized.TerminalTheme = strings.TrimSpace(normalized.TerminalTheme)
	if len(normalized.TerminalTheme) > 128 {
		normalized.TerminalTheme = normalized.TerminalTheme[:128]
	}

	// Drop empty profile payload to keep saved JSON clean.
	if normalized.Term == "" &&
		normalized.FontSize == 0 &&
		normalized.StartupCommand == "" &&
		normalized.StartupCommandDelayMs == 0 &&
		normalized.TerminalTheme == "" {
		return nil
	}

	return &normalized
}
