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
	transferID string,
) error {
	sourceClient, err := m.GetSFTPClient(sourceSessionID)
	if err != nil {
		return fmt.Errorf("failed to get source SFTP client: %w", err)
	}

	destClient, err := m.GetSFTPClient(destSessionID)
	if err != nil {
		return fmt.Errorf("failed to get destination SFTP client: %w", err)
	}

	cancel := make(chan struct{})

	transfersMu.Lock()
	activeRemoteTransfers[transferID] = cancel
	transfersMu.Unlock()

	defer func() {
		transfersMu.Lock()
		delete(activeRemoteTransfers, transferID)
		transfersMu.Unlock()
	}()

	return remote.Transfer(sourceClient.GetClient(), destClient.GetClient(), sourcePath, destPath, progress, cancel)
}

func (m *Manager) BulkRemoteTransfer(
	sourceSessionID string,
	destSessionID string,
	sourcePaths []string,
	destDir string,
	progress remote.ProgressCallback,
	transferID string,
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

	cancel := make(chan struct{})

	transfersMu.Lock()
	activeRemoteTransfers[transferID] = cancel
	transfersMu.Unlock()

	defer func() {
		transfersMu.Lock()
		delete(activeRemoteTransfers, transferID)
		transfersMu.Unlock()
	}()

	return remote.BulkTransfer(sourceClient.GetClient(), destClient.GetClient(), sourcePaths, destDir, progress, cancel)
}

func (m *Manager) CancelRemoteTransfer(transferID string) bool {
	transfersMu.Lock()
	defer transfersMu.Unlock()

	if cancel, ok := activeRemoteTransfers[transferID]; ok {
		close(cancel)
		delete(activeRemoteTransfers, transferID)
		return true
	}
	return false
}
