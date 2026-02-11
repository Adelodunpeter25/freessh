package logs

import (
	"fmt"
	"freessh-backend/internal/freesshhistory"
	"os"
	"path/filepath"
	"sort"
	"strings"
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

type Manager struct{}

func NewManager() *Manager {
	return &Manager{}
}

func (m *Manager) ListLogs() ([]LogEntry, error) {
	dir, err := getLogsDir()
	if err != nil {
		return nil, err
	}

	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("failed to read logs directory: %w", err)
	}

	var logs []LogEntry
	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".log") {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		entry := m.parseLogFilename(file.Name())
		entry.Size = info.Size()
		entry.Path = filepath.Join(dir, file.Name())
		logs = append(logs, entry)
	}

	sort.Slice(logs, func(i, j int) bool {
		return logs[i].Timestamp.After(logs[j].Timestamp)
	})

	return logs, nil
}

func (m *Manager) ReadLog(filename string) (string, error) {
	dir, err := getLogsDir()
	if err != nil {
		return "", err
	}

	path := filepath.Join(dir, filename)
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read log file: %w", err)
	}

	return freesshhistory.SanitizeLogContent(string(data)), nil
}

func (m *Manager) DeleteLog(filename string) error {
	dir, err := getLogsDir()
	if err != nil {
		return err
	}

	path := filepath.Join(dir, filename)
	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to delete log file: %w", err)
	}

	return nil
}

func (m *Manager) DeleteAllLogs() error {
	dir, err := getLogsDir()
	if err != nil {
		return err
	}

	files, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("failed to read logs directory: %w", err)
	}

	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".log") {
			continue
		}

		path := filepath.Join(dir, file.Name())
		if err := os.Remove(path); err != nil {
			return fmt.Errorf("failed to delete log file %s: %w", file.Name(), err)
		}
	}

	return nil
}

func (m *Manager) parseLogFilename(filename string) LogEntry {
	// Format: connectionname_2006-01-02_15-04-05.log
	name := strings.TrimSuffix(filename, ".log")
	parts := strings.Split(name, "_")

	entry := LogEntry{
		Filename:  filename,
		Timestamp: time.Now(),
	}

	if len(parts) >= 3 {
		entry.ConnectionName = parts[0]
		dateStr := parts[len(parts)-2] + "_" + parts[len(parts)-1]
		if t, err := time.ParseInLocation("2006-01-02_15-04-05", dateStr, time.Local); err == nil {
			entry.Timestamp = t
		}
	}

	return entry
}
