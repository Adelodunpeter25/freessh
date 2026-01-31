package session

import (
	"freessh-backend/internal/models"

	"github.com/google/uuid"
)

func (m *Manager) UploadFile(sessionID, localPath, remotePath string, progressChan chan<- models.TransferProgress) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	transferID := uuid.New().String()
	cancel := make(chan struct{})

	transfersMu.Lock()
	activeTransfers[transferID] = cancel
	transfersMu.Unlock()

	defer func() {
		transfersMu.Lock()
		delete(activeTransfers, transferID)
		transfersMu.Unlock()
	}()

	return session.SFTPClient.Upload(localPath, remotePath, func(transferred, total int64) {
		if progressChan != nil {
			percentage := float64(transferred) / float64(total) * 100
			progressChan <- models.TransferProgress{
				TransferID:  transferID,
				Filename:    localPath,
				Total:       total,
				Transferred: transferred,
				Percentage:  percentage,
				Status:      "uploading",
			}
		}
	}, cancel)
}

func (m *Manager) DownloadFile(sessionID, remotePath, localPath string, progressChan chan<- models.TransferProgress) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	transferID := uuid.New().String()
	cancel := make(chan struct{})

	transfersMu.Lock()
	activeTransfers[transferID] = cancel
	transfersMu.Unlock()

	defer func() {
		transfersMu.Lock()
		delete(activeTransfers, transferID)
		transfersMu.Unlock()
	}()

	return session.SFTPClient.Download(remotePath, localPath, func(transferred, total int64) {
		if progressChan != nil {
			percentage := float64(transferred) / float64(total) * 100
			progressChan <- models.TransferProgress{
				TransferID:  transferID,
				Filename:    remotePath,
				Total:       total,
				Transferred: transferred,
				Percentage:  percentage,
				Status:      "downloading",
			}
		}
	}, cancel)
}

func (m *Manager) CancelTransfer(transferID string) bool {
	transfersMu.Lock()
	defer transfersMu.Unlock()

	if cancel, ok := activeTransfers[transferID]; ok {
		close(cancel)
		delete(activeTransfers, transferID)
		return true
	}
	return false
}
