package utils

import "freessh-backend/internal/models"

// ShouldAddToHistory checks if a command should be added to history
// Returns false if the command is a duplicate of the last entry
func ShouldAddToHistory(command string, entries []models.HistoryEntry) bool {
	if len(entries) == 0 {
		return true
	}
	
	// Check if last entry is the same command
	lastEntry := entries[len(entries)-1]
	return lastEntry.Command != command
}
