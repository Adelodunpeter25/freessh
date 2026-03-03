package utils

import (
	"freessh-backend/internal/models"
	"testing"
)

func TestNormalizeHistoryCommand_StripsControlAndWhitespace(t *testing.T) {
	got := NormalizeHistoryCommand(" \r\n\tls -la\x00 \r\n")
	want := "ls -la"
	if got != want {
		t.Fatalf("unexpected normalized command: got %q want %q", got, want)
	}
}

func TestShouldAddToHistory_RejectsDuplicateWithinRecentWindow(t *testing.T) {
	entries := []models.HistoryEntry{
		{ID: "1", Command: "git status"},
		{ID: "2", Command: "ls -la"},
		{ID: "3", Command: "npm test"},
	}

	if ShouldAddToHistory("  ls -la  ", entries) {
		t.Fatalf("expected duplicate command to be rejected")
	}
}

func TestShouldAddToHistory_AllowsNewCommand(t *testing.T) {
	entries := []models.HistoryEntry{
		{ID: "1", Command: "git status"},
		{ID: "2", Command: "ls -la"},
	}

	if !ShouldAddToHistory("docker ps", entries) {
		t.Fatalf("expected new command to be accepted")
	}
}
