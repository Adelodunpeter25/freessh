package remote

import (
	"fmt"
	"path/filepath"
	"sync"
	"sync/atomic"

	"github.com/pkg/sftp"
)

const maxConcurrentTransfers = 5

func BulkTransfer(
	sourceClient *sftp.Client,
	destClient *sftp.Client,
	sourcePaths []string,
	destDir string,
	progress ProgressCallback,
	cancel <-chan struct{},
) []RemoteTransferResult {
	if sourceClient == nil || destClient == nil {
		return []RemoteTransferResult{{
			Success: false,
			Error:   "SFTP clients not connected",
		}}
	}

	results := make([]RemoteTransferResult, len(sourcePaths))
	var wg sync.WaitGroup
	sem := make(chan struct{}, maxConcurrentTransfers)

	var completed, failed int32
	var totalBytes, transferredBytes int64
	var fileOffsets sync.Map // Track per-file byte offsets

	// Calculate total size (including directories)
	for _, path := range sourcePaths {
		size := calculateSize(sourceClient, path)
		atomic.AddInt64(&totalBytes, size)
	}

	for i, sourcePath := range sourcePaths {
		wg.Add(1)
		go func(index int, path string) {
			defer wg.Done()

			select {
			case <-cancel:
				results[index] = RemoteTransferResult{
					SourcePath: path,
					Success:    false,
					Error:      "transfer cancelled",
				}
				atomic.AddInt32(&failed, 1)
				return
			case sem <- struct{}{}:
			}
			defer func() { <-sem }()

			fileName := filepath.Base(path)
			destPath := filepath.Join(destDir, fileName)

			if progress != nil {
				progress(RemoteTransferProgress{
					TotalItems:       len(sourcePaths),
					CompletedItems:   int(atomic.LoadInt32(&completed)),
					FailedItems:      int(atomic.LoadInt32(&failed)),
					CurrentItem:      fileName,
					BytesTransferred: atomic.LoadInt64(&transferredBytes),
					TotalBytes:       atomic.LoadInt64(&totalBytes),
				})
			}

			err := transferRecursive(sourceClient, destClient, path, destPath, func(transferred, total int64) {
				// Calculate delta from last reported progress for this file
				var lastTransferred int64
				if val, ok := fileOffsets.Load(path); ok {
					lastTransferred = val.(int64)
				}
				delta := transferred - lastTransferred
				fileOffsets.Store(path, transferred)
				
				// Add delta to total transferred bytes
				atomic.AddInt64(&transferredBytes, delta)
				
				if progress != nil {
					progress(RemoteTransferProgress{
						TotalItems:       len(sourcePaths),
						CompletedItems:   int(atomic.LoadInt32(&completed)),
						FailedItems:      int(atomic.LoadInt32(&failed)),
						CurrentItem:      fileName,
						BytesTransferred: atomic.LoadInt64(&transferredBytes),
						TotalBytes:       atomic.LoadInt64(&totalBytes),
					})
				}
			}, cancel)

			if err != nil {
				results[index] = RemoteTransferResult{
					SourcePath: path,
					DestPath:   destPath,
					Success:    false,
					Error:      err.Error(),
				}
				atomic.AddInt32(&failed, 1)
			} else {
				results[index] = RemoteTransferResult{
					SourcePath: path,
					DestPath:   destPath,
					Success:    true,
				}
				atomic.AddInt32(&completed, 1)
			}

			if progress != nil {
				progress(RemoteTransferProgress{
					TotalItems:       len(sourcePaths),
					CompletedItems:   int(atomic.LoadInt32(&completed)),
					FailedItems:      int(atomic.LoadInt32(&failed)),
					CurrentItem:      fileName,
					BytesTransferred: atomic.LoadInt64(&transferredBytes),
					TotalBytes:       atomic.LoadInt64(&totalBytes),
				})
			}
		}(i, sourcePath)
	}

	wg.Wait()
	return results
}

func calculateSize(client *sftp.Client, path string) int64 {
	stat, err := client.Stat(path)
	if err != nil {
		return 0
	}

	if !stat.IsDir() {
		return stat.Size()
	}

	var total int64
	entries, err := client.ReadDir(path)
	if err != nil {
		return 0
	}

	for _, entry := range entries {
		childPath := filepath.Join(path, entry.Name())
		total += calculateSize(client, childPath)
	}

	return total
}

func transferRecursive(
	sourceClient *sftp.Client,
	destClient *sftp.Client,
	sourcePath string,
	destPath string,
	progress func(transferred, total int64),
	cancel <-chan struct{},
) error {
	stat, err := sourceClient.Stat(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to stat source: %w", err)
	}

	if !stat.IsDir() {
		return Transfer(sourceClient, destClient, sourcePath, destPath, progress, cancel)
	}

	// Create destination directory
	if err := destClient.MkdirAll(destPath); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// List source directory
	entries, err := sourceClient.ReadDir(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to read directory: %w", err)
	}

	// Transfer all entries
	for _, entry := range entries {
		select {
		case <-cancel:
			return fmt.Errorf("transfer cancelled")
		default:
		}

		srcPath := filepath.Join(sourcePath, entry.Name())
		dstPath := filepath.Join(destPath, entry.Name())

		if err := transferRecursive(sourceClient, destClient, srcPath, dstPath, progress, cancel); err != nil {
			return err
		}
	}

	return nil
}
