package session

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var (
	logsDir     string
	logsDirOnce sync.Once
	logsDirErr  error
)

func getLogsDir() (string, error) {
	logsDirOnce.Do(func() {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			logsDirErr = fmt.Errorf("failed to get home directory: %w", err)
			return
		}

		logsDir = filepath.Join(homeDir, ".freessh", "logs")
		if err := os.MkdirAll(logsDir, 0755); err != nil {
			logsDirErr = fmt.Errorf("failed to create logs directory: %w", err)
		}
	})
	return logsDir, logsDirErr
}

func (m *Manager) StartLogging(sessionID string) (string, error) {
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()

	if !exists {
		return "", fmt.Errorf("session not found: %s", sessionID)
	}

	if session.isLogging {
		return "", fmt.Errorf("session is already logging")
	}

	logsDir, err := getLogsDir()
	if err != nil {
		return "", err
	}

	timestamp := time.Now().Format("2006-01-02_15-04-05")
	sessionPrefix := sessionID
	if len(sessionID) > 8 {
		sessionPrefix = sessionID[:8]
	}
	filename := fmt.Sprintf("session_%s_%s.log", sessionPrefix, timestamp)
	logPath := filepath.Join(logsDir, filename)

	file, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return "", fmt.Errorf("failed to create log file: %w", err)
	}

	session.logFile = file
	session.isLogging = true

	return logPath, nil
}

func (m *Manager) StopLogging(sessionID string) error {
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()

	if !exists {
		return fmt.Errorf("session not found: %s", sessionID)
	}

	if !session.isLogging {
		return fmt.Errorf("session is not logging")
	}

	if session.logFile != nil {
		if err := session.logFile.Sync(); err != nil {
			return fmt.Errorf("failed to sync log file: %w", err)
		}
		if err := session.logFile.Close(); err != nil {
			return fmt.Errorf("failed to close log file: %w", err)
		}
		session.logFile = nil
	}

	session.isLogging = false
	return nil
}
