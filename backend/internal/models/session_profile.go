package models

import "strings"

// SessionProfile stores per-connection terminal defaults.
// Most fields are currently renderer-driven; backend actively applies TERM and startup command.
type SessionProfile struct {
	Shell                 string `json:"shell,omitempty"`
	Term                  string `json:"term,omitempty"`
	FontSize              int    `json:"font_size,omitempty"`
	ScrollbackLimit       int    `json:"scrollback_limit,omitempty"`
	StartupCommand        string `json:"startup_command,omitempty"`
	StartupCommandDelayMs int    `json:"startup_command_delay_ms,omitempty"`
}

func NormalizeSessionProfile(profile *SessionProfile) *SessionProfile {
	if profile == nil {
		return nil
	}

	normalized := *profile

	normalized.Shell = strings.ToLower(strings.TrimSpace(normalized.Shell))
	switch normalized.Shell {
	case "", "auto", "bash", "zsh", "fish", "pwsh":
		// allowed
	default:
		normalized.Shell = ""
	}

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
	if normalized.ScrollbackLimit < 0 {
		normalized.ScrollbackLimit = 0
	}
	if normalized.StartupCommandDelayMs < 0 {
		normalized.StartupCommandDelayMs = 0
	}
	if normalized.StartupCommandDelayMs > 60000 {
		normalized.StartupCommandDelayMs = 60000
	}

	// Drop empty profile payload to keep saved JSON clean.
	if normalized.Shell == "" &&
		normalized.Term == "" &&
		normalized.FontSize == 0 &&
		normalized.ScrollbackLimit == 0 &&
		normalized.StartupCommand == "" &&
		normalized.StartupCommandDelayMs == 0 {
		return nil
	}

	return &normalized
}
