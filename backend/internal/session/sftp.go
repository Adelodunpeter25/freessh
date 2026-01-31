package session

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/sftp"
	"strings"
	"sync"

	"github.com/google/uuid"
)

var (
	activeTransfers = make(map[string]chan struct{})
	transfersMu     sync.Mutex
)

func (m *Manager) ensureSFTP(sessionID string) (*sftp.Client, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return nil, err
		}
	}

	return session.SFTPClient, nil
}

func isConnectionError(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "connection lost") || strings.Contains(msg, "EOF") || strings.Contains(msg, "broken pipe")
}

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

	content, err := session.SFTPClient.ReadFile(path, binary)
	if err != nil && !session.SFTPClient.IsConnected() {
		// Reconnect and retry once
		if err := session.SFTPClient.Connect(); err != nil {
			return "", err
		}
		return session.SFTPClient.ReadFile(path, binary)
	}
	return content, err
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

func (m *Manager) Chmod(sessionID, path string, mode uint32) error {
	client, err := m.ensureSFTP(sessionID)
	if err != nil {
		return err
	}
	return client.Chmod(path, mode)
}

func (m *Manager) BulkDownload(sessionID string, remotePaths []string, localBaseDir string, progress func(models.BulkProgress)) ([]models.BulkResult, error) {
	client, err := m.ensureSFTP(sessionID)
	if err != nil {
		return nil, err
	}

	sftpResults, err := client.BulkDownload(remotePaths, localBaseDir, func(p sftp.BulkProgress) {
		if progress != nil {
			progress(models.BulkProgress{
				TotalItems:     p.TotalItems,
				CompletedItems: p.CompletedItems,
				FailedItems:    p.FailedItems,
				CurrentItem:    p.CurrentItem,
			})
		}
	})

	if err != nil {
		return nil, err
	}

	results := make([]models.BulkResult, len(sftpResults))
	for i, r := range sftpResults {
		results[i] = models.BulkResult{
			Path:    r.Path,
			Success: r.Success,
			Error:   r.Error,
		}
	}

	return results, nil
}

func (m *Manager) BulkUpload(sessionID string, localPaths []string, remoteBaseDir string, progress func(models.BulkProgress)) ([]models.BulkResult, error) {
	client, err := m.ensureSFTP(sessionID)
	if err != nil {
		return nil, err
	}

	sftpResults, err := client.BulkUpload(localPaths, remoteBaseDir, func(p sftp.BulkProgress) {
		if progress != nil {
			progress(models.BulkProgress{
				TotalItems:     p.TotalItems,
				CompletedItems: p.CompletedItems,
				FailedItems:    p.FailedItems,
				CurrentItem:    p.CurrentItem,
			})
		}
	})

	if err != nil {
		return nil, err
	}

	results := make([]models.BulkResult, len(sftpResults))
	for i, r := range sftpResults {
		results[i] = models.BulkResult{
			Path:    r.Path,
			Success: r.Success,
			Error:   r.Error,
		}
	}

	return results, nil
}

func (m *Manager) BulkDelete(sessionID string, remotePaths []string, progress func(models.BulkProgress)) ([]models.BulkResult, error) {
	client, err := m.ensureSFTP(sessionID)
	if err != nil {
		return nil, err
	}

	sftpResults, err := client.BulkDelete(remotePaths, func(p sftp.BulkProgress) {
		if progress != nil {
			progress(models.BulkProgress{
				TotalItems:     p.TotalItems,
				CompletedItems: p.CompletedItems,
				FailedItems:    p.FailedItems,
				CurrentItem:    p.CurrentItem,
			})
		}
	})

	if err != nil {
		return nil, err
	}

	results := make([]models.BulkResult, len(sftpResults))
	for i, r := range sftpResults {
		results[i] = models.BulkResult{
			Path:    r.Path,
			Success: r.Success,
			Error:   r.Error,
		}
	}

	return results, nil
}


