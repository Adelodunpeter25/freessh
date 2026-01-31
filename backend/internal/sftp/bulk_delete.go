package sftp

import (
	"fmt"
	"path/filepath"
	"sync"
)

// BulkDelete deletes multiple files/directories
func (c *Client) BulkDelete(remotePaths []string, progress BulkProgressCallback) ([]BulkResult, error) {
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

	sem := make(chan struct{}, maxConcurrentTransfers)
	var wg sync.WaitGroup

	for _, remotePath := range remotePaths {
		wg.Add(1)
		go func(rPath string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			updateProgress(rPath)

			err := c.deleteRecursive(rPath)
			
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

func (c *Client) deleteRecursive(remotePath string) error {
	stat, err := c.sftpClient.Stat(remotePath)
	if err != nil {
		return fmt.Errorf("failed to stat %s: %w", remotePath, err)
	}

	if !stat.IsDir() {
		return c.sftpClient.Remove(remotePath)
	}

	// List directory entries
	entries, err := c.sftpClient.ReadDir(remotePath)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", remotePath, err)
	}

	// Delete all entries first
	for _, entry := range entries {
		entryPath := filepath.Join(remotePath, entry.Name())
		if err := c.deleteRecursive(entryPath); err != nil {
			return err
		}
	}

	// Delete the directory itself
	return c.sftpClient.RemoveDirectory(remotePath)
}
