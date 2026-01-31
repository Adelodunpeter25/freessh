package session

import (
	"fmt"
	"freessh-backend/internal/sftp/remote"
)

func (m *Manager) RemoteTransfer(
	sourceSessionID string,
	destSessionID string,
	sourcePath string,
	destPath string,
	progress func(transferred, total int64),
	cancel <-chan struct{},
) error {
	sourceClient, err := m.GetSFTPClient(sourceSessionID)
	if err != nil {
		return fmt.Errorf("failed to get source SFTP client: %w", err)
	}

	destClient, err := m.GetSFTPClient(destSessionID)
	if err != nil {
		return fmt.Errorf("failed to get destination SFTP client: %w", err)
	}

	return remote.Transfer(sourceClient.GetClient(), destClient.GetClient(), sourcePath, destPath, progress, cancel)
}

func (m *Manager) BulkRemoteTransfer(
	sourceSessionID string,
	destSessionID string,
	sourcePaths []string,
	destDir string,
	progress remote.ProgressCallback,
	cancel <-chan struct{},
) []remote.RemoteTransferResult {
	sourceClient, err := m.GetSFTPClient(sourceSessionID)
	if err != nil {
		return []remote.RemoteTransferResult{{
			Success: false,
			Error:   fmt.Sprintf("failed to get source SFTP client: %v", err),
		}}
	}

	destClient, err := m.GetSFTPClient(destSessionID)
	if err != nil {
		return []remote.RemoteTransferResult{{
			Success: false,
			Error:   fmt.Sprintf("failed to get destination SFTP client: %v", err),
		}}
	}

	return remote.BulkTransfer(sourceClient.GetClient(), destClient.GetClient(), sourcePaths, destDir, progress, cancel)
}
