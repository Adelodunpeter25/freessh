package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	_ "modernc.org/sqlite"
)

const databaseName = "freessh.db"

var (
	openOnce sync.Once
	openDB   *sql.DB
	openErr  error
)

func Open() (*sql.DB, error) {
	openOnce.Do(func() {
		path, err := databasePath()
		if err != nil {
			openErr = err
			return
		}

		db, err := sql.Open("sqlite", path)
		if err != nil {
			openErr = fmt.Errorf("failed to open sqlite database: %w", err)
			return
		}

		db.SetMaxOpenConns(1)
		db.SetMaxIdleConns(1)

		if err := ensureSchema(db); err != nil {
			_ = db.Close()
			openErr = err
			return
		}

		openDB = db
	})

	return openDB, openErr
}

func databasePath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get home directory: %w", err)
	}

	configDir := filepath.Join(homeDir, ".freessh")
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return "", fmt.Errorf("failed to create config directory: %w", err)
	}

	return filepath.Join(configDir, databaseName), nil
}

func ensureSchema(db *sql.DB) error {
	if _, err := db.Exec("PRAGMA foreign_keys = ON;"); err != nil {
		return fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	if _, err := db.Exec(SchemaSQL); err != nil {
		return fmt.Errorf("failed to apply schema: %w", err)
	}

	if _, err := db.Exec(MigrationSQL); err != nil && !isDuplicateColumnError(err) {
		return fmt.Errorf("failed to apply migration: %w", err)
	}

	return nil
}

func isDuplicateColumnError(err error) bool {
	if err == nil {
		return false
	}
	lower := strings.ToLower(err.Error())
	return strings.Contains(lower, "duplicate column") ||
		strings.Contains(lower, "already exists")
}
