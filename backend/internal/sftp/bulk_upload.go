package sftp

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
)

// BulkUpload uploads multiple files/directories from local to remote
func (c *Client) BulkUpload(localPaths []string, remoteBaseDir string, progress BulkProgressCallback) ([]BulkResult, error) {
	if !c.IsConnected() {
		return nil, fmt.Errorf("SFTP not connected")
	}

	results := make([]BulkResult, 0, len(localPaths))
	resultsMu := sync.Mutex{}
	
	var completed, failed int
	var progressMu sync.Mutex

	updateProgress := func(current string) {
		if progress != nil {
			progressMu.Lock()
			progress(BulkProgress{
				TotalItems:     len(localPaths),
				CompletedItems: completed,
				FailedItems:    failed,
				CurrentItem:    current,
			})
			progressMu.Unlock()
		}
	}

	sem := make(chan struct{}, maxConcurrentTransfers)
	var wg sync.WaitGroup

	for _, localPath := range localPaths {
		wg.Add(1)
		go func(lPath string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			updateProgress(lPath)

			err := c.uploadRecursive(lPath, remoteBaseDir)
			
			resultsMu.Lock()
			if err != nil {
				results = append(results, BulkResult{Path: lPath, Success: false, Error: err.Error()})
				progressMu.Lock()
				failed++
				progressMu.Unlock()
			} else {
				results = append(results, BulkResult{Path: lPath, Success: true})
				progressMu.Lock()
				completed++
				progressMu.Unlock()
			}
			resultsMu.Unlock()

			updateProgress(lPath)
		}(localPath)
	}

	wg.Wait()
	return results, nil
}

func (c *Client) uploadRecursive(localPath, remoteBaseDir string) error {
	stat, err := os.Stat(localPath)
	if err != nil {
		return fmt.Errorf("failed to stat %s: %w", localPath, err)
	}

	remotePath := filepath.Join(remoteBaseDir, filepath.Base(localPath))

	if !stat.IsDir() {
		return c.uploadFile(localPath, remotePath)
	}

	// Create remote directory
	if err := c.sftpClient.MkdirAll(remotePath); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", remotePath, err)
	}

	// List local directory
	entries, err := os.ReadDir(localPath)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", localPath, err)
	}

	// Empty directory - done
	if len(entries) == 0 {
		return nil
	}

	// Upload all entries
	for _, entry := range entries {
		localEntryPath := filepath.Join(localPath, entry.Name())
		remoteEntryPath := filepath.Join(remotePath, entry.Name())

		if entry.IsDir() {
			if err := c.uploadRecursive(localEntryPath, filepath.Dir(remoteEntryPath)); err != nil {
				return err
			}
		} else {
			if err := c.uploadFile(localEntryPath, remoteEntryPath); err != nil {
				return err
			}
		}
	}

	return nil
}

func (c *Client) uploadFile(localPath, remotePath string) error {
	localFile, err := os.Open(localPath)
	if err != nil {
		return fmt.Errorf("failed to open local file: %w", err)
	}
	defer localFile.Close()

	if err := c.sftpClient.MkdirAll(filepath.Dir(remotePath)); err != nil {
		return fmt.Errorf("failed to create remote directory: %w", err)
	}

	remoteFile, err := c.sftpClient.Create(remotePath)
	if err != nil {
		return fmt.Errorf("failed to create remote file: %w", err)
	}
	defer remoteFile.Close()

	buf := make([]byte, bufferSize)
	_, err = io.CopyBuffer(remoteFile, localFile, buf)
	if err != nil {
		return fmt.Errorf("failed to copy file: %w", err)
	}

	return nil
}
