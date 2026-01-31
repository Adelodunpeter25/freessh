package sftp

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
)

// BulkDownload downloads multiple files/directories from remote to local
func (c *Client) BulkDownload(remotePaths []string, localBaseDir string, progress BulkProgressCallback) ([]BulkResult, error) {
	if !c.IsConnected() {
		return nil, fmt.Errorf("SFTP not connected")
	}

	results := make([]BulkResult, 0, len(remotePaths))
	resultsMu := sync.Mutex{}
	
	var completed, failed int
	var progressMu sync.Mutex

	updateProgress := func(current string) {
		if progress != nil {
			progressMu.Lock()
			progress(BulkProgress{
				TotalItems:     len(remotePaths),
				CompletedItems: completed,
				FailedItems:    failed,
				CurrentItem:    current,
			})
			progressMu.Unlock()
		}
	}

	// Semaphore for concurrency control
	sem := make(chan struct{}, maxConcurrentTransfers)
	var wg sync.WaitGroup

	for _, remotePath := range remotePaths {
		wg.Add(1)
		go func(rPath string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			updateProgress(rPath)

			err := c.downloadRecursive(rPath, localBaseDir)
			
			resultsMu.Lock()
			if err != nil {
				results = append(results, BulkResult{Path: rPath, Success: false, Error: err.Error()})
				progressMu.Lock()
				failed++
				progressMu.Unlock()
			} else {
				results = append(results, BulkResult{Path: rPath, Success: true})
				progressMu.Lock()
				completed++
				progressMu.Unlock()
			}
			resultsMu.Unlock()

			updateProgress(rPath)
		}(remotePath)
	}

	wg.Wait()
	return results, nil
}

func (c *Client) downloadRecursive(remotePath, localBaseDir string) error {
	stat, err := c.sftpClient.Stat(remotePath)
	if err != nil {
		return fmt.Errorf("failed to stat %s: %w", remotePath, err)
	}

	localPath := filepath.Join(localBaseDir, filepath.Base(remotePath))

	if !stat.IsDir() {
		return c.downloadFile(remotePath, localPath)
	}

	// Create local directory
	if err := os.MkdirAll(localPath, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", localPath, err)
	}

	// List remote directory
	entries, err := c.sftpClient.ReadDir(remotePath)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", remotePath, err)
	}

	// Empty directory - done
	if len(entries) == 0 {
		return nil
	}

	// Download all entries
	for _, entry := range entries {
		remoteEntryPath := filepath.Join(remotePath, entry.Name())
		localEntryPath := filepath.Join(localPath, entry.Name())

		if entry.IsDir() {
			if err := c.downloadRecursive(remoteEntryPath, filepath.Dir(localEntryPath)); err != nil {
				return err
			}
		} else {
			if err := c.downloadFile(remoteEntryPath, localEntryPath); err != nil {
				return err
			}
		}
	}

	return nil
}

func (c *Client) downloadFile(remotePath, localPath string) error {
	remoteFile, err := c.sftpClient.Open(remotePath)
	if err != nil {
		return fmt.Errorf("failed to open remote file: %w", err)
	}
	defer remoteFile.Close()

	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return fmt.Errorf("failed to create local directory: %w", err)
	}

	localFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer localFile.Close()

	buf := make([]byte, bufferSize)
	_, err = io.CopyBuffer(localFile, remoteFile, buf)
	if err != nil {
		os.Remove(localPath)
		return fmt.Errorf("failed to copy file: %w", err)
	}

	return nil
}
