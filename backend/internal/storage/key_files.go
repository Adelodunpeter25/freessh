package storage

import (
	"fmt"
	"os"
	"path/filepath"
)

type KeyFileStorage struct {
	keysDir string
}

func NewKeyFileStorage() (*KeyFileStorage, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	keysDir := filepath.Join(homeDir, ".freessh", "keys")
	if err := os.MkdirAll(keysDir, 0700); err != nil {
		return nil, fmt.Errorf("failed to create keys directory: %w", err)
	}

	return &KeyFileStorage{
		keysDir: keysDir,
	}, nil
}

func (s *KeyFileStorage) SavePrivateKey(keyID string, privateKey string) error {
	keyPath := filepath.Join(s.keysDir, keyID+".pem")
	if err := os.WriteFile(keyPath, []byte(privateKey), 0600); err != nil {
		return fmt.Errorf("failed to write private key: %w", err)
	}
	return nil
}

func (s *KeyFileStorage) GetPrivateKey(keyID string) (string, error) {
	keyPath := filepath.Join(s.keysDir, keyID+".pem")
	data, err := os.ReadFile(keyPath)
	if err != nil {
		return "", fmt.Errorf("failed to read private key: %w", err)
	}
	return string(data), nil
}

func (s *KeyFileStorage) DeletePrivateKey(keyID string) error {
	keyPath := filepath.Join(s.keysDir, keyID+".pem")
	if err := os.Remove(keyPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete private key: %w", err)
	}
	return nil
}
