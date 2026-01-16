package session

import (
	"freessh-backend/internal/models"
	"sync"

	"github.com/google/uuid"
)

var (
	activeTransfers = make(map[string]chan struct{})
	transfersMu     sync.Mutex
)

func (m *Manager) InitSFTP(sessionID string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if session.SFTPClient.IsConnected() {
		return nil
	}

	return session.SFTPClient.Connect()
}

func (m *Manager) ListFiles(sessionID, path string) ([]models.FileInfo, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return nil, err
		}
	}

	return session.SFTPClient.List(path)
}

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

func (m *Manager) DeleteFile(sessionID, path string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	return session.SFTPClient.Remove(path)
}

func (m *Manager) CreateDirectory(sessionID, path string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	return session.SFTPClient.Mkdir(path)
}

func (m *Manager) RenameFile(sessionID, oldPath, newPath string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	return session.SFTPClient.Rename(oldPath, newPath)
}

func (m *Manager) ReadFile(sessionID, path string, binary bool) (string, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return "", err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return "", err
		}
	}

	return session.SFTPClient.ReadFile(path, binary)
}

func (m *Manager) WriteFile(sessionID, path, content string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	return session.SFTPClient.WriteFile(path, content)
}
