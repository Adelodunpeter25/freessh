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

	// Calculate total size
	for _, path := range sourcePaths {
		if file, err := sourceClient.Stat(path); err == nil && !file.IsDir() {
			atomic.AddInt64(&totalBytes, file.Size())
		}
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

			err := Transfer(sourceClient, destClient, path, destPath, func(transferred, total int64) {
				atomic.StoreInt64(&transferredBytes, transferred)
				if progress != nil {
					progress(RemoteTransferProgress{
						TotalItems:       len(sourcePaths),
						CompletedItems:   int(atomic.LoadInt32(&completed)),
						FailedItems:      int(atomic.LoadInt32(&failed)),
						CurrentItem:      fileName,
						BytesTransferred: transferred,
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
