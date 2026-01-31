package session

import (
	"freessh-backend/internal/models"
	"freessh-backend/internal/sftp"
	"strings"
	"sync"
)

var (
	activeTransfers       = make(map[string]chan struct{})
	activeRemoteTransfers = make(map[string]chan struct{})
	transfersMu           sync.Mutex
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

func (m *Manager) GetSFTPClient(sessionID string) (*sftp.Client, error) {
	return m.ensureSFTP(sessionID)
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
