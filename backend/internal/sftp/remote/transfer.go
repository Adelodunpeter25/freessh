package remote

import (
	"fmt"
	"io"
	"path/filepath"

	"github.com/pkg/sftp"
)

func Transfer(
	sourceClient *sftp.Client,
	destClient *sftp.Client,
	sourcePath string,
	destPath string,
	progress func(transferred, total int64),
	cancel <-chan struct{},
) error {
	if sourceClient == nil || destClient == nil {
		return fmt.Errorf("SFTP clients not connected")
	}

	// Open source file
	sourceFile, err := sourceClient.Open(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to open source file: %w", err)
	}
	defer sourceFile.Close()

	// Get source file size
	stat, err := sourceFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat source file: %w", err)
	}

	// Create destination directory if needed
	destDir := filepath.Dir(destPath)
	if err := destClient.MkdirAll(destDir); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	// Create destination file
	destFile, err := destClient.Create(destPath)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer destFile.Close()

	// Dynamic buffer size based on file size
	bufSize := 256 * 1024 // 256KB default
	if stat.Size() > 100*1024*1024 { // >100MB
		bufSize = 1024 * 1024 // 1MB
	}

	buf := make([]byte, bufSize)
	var transferred int64
	var lastReported int64
	const reportInterval = 512 * 1024 // Report every 512KB

	for {
		select {
		case <-cancel:
			destClient.Remove(destPath)
			return fmt.Errorf("transfer cancelled")
		default:
		}

		n, err := sourceFile.Read(buf)
		if err != nil && err != io.EOF {
			return fmt.Errorf("failed to read source file: %w", err)
		}
		if n == 0 {
			break
		}

		if _, err := destFile.Write(buf[:n]); err != nil {
			return fmt.Errorf("failed to write destination file: %w", err)
		}

		transferred += int64(n)
		if progress != nil && (transferred-lastReported >= reportInterval || transferred == stat.Size()) {
			progress(transferred, stat.Size())
			lastReported = transferred
		}
	}

	// Final progress update
	if progress != nil && transferred > lastReported {
		progress(transferred, stat.Size())
	}

	return nil
}
