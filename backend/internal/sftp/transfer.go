package sftp

import (
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

var ErrTransferCancelled = errors.New("transfer cancelled")

type ProgressCallback func(transferred, total int64)

func (c *Client) Upload(localPath, remotePath string, progress ProgressCallback, cancel <-chan struct{}) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	localFile, err := os.Open(localPath)
	if err != nil {
		return fmt.Errorf("failed to open local file: %w", err)
	}
	defer localFile.Close()

	stat, err := localFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat local file: %w", err)
	}

	remoteFile, err := c.sftpClient.Create(remotePath)
	if err != nil {
		return fmt.Errorf("failed to create remote file: %w", err)
	}
	defer remoteFile.Close()

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
			c.sftpClient.Remove(remotePath)
			return ErrTransferCancelled
		default:
		}

		n, err := localFile.Read(buf)
		if err != nil && err != io.EOF {
			return fmt.Errorf("failed to read local file: %w", err)
		}
		if n == 0 {
			break
		}

		if _, err := remoteFile.Write(buf[:n]); err != nil {
			return fmt.Errorf("failed to write remote file: %w", err)
		}

		transferred += int64(n)
		// Only report progress every 512KB or on completion
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

func (c *Client) Download(remotePath, localPath string, progress ProgressCallback, cancel <-chan struct{}) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	remoteFile, err := c.sftpClient.Open(remotePath)
	if err != nil {
		return fmt.Errorf("failed to open remote file: %w", err)
	}
	defer remoteFile.Close()

	stat, err := remoteFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat remote file: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return fmt.Errorf("failed to create local directory: %w", err)
	}

	localFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer localFile.Close()

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
			localFile.Close()
			os.Remove(localPath)
			return ErrTransferCancelled
		default:
		}

		n, err := remoteFile.Read(buf)
		if err != nil && err != io.EOF {
			return fmt.Errorf("failed to read remote file: %w", err)
		}
		if n == 0 {
			break
		}

		if _, err := localFile.Write(buf[:n]); err != nil {
			return fmt.Errorf("failed to write local file: %w", err)
		}

		transferred += int64(n)
		// Only report progress every 512KB or on completion
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

func (c *Client) ReadFile(remotePath string, binary bool) (string, error) {
	if !c.IsConnected() {
		return "", fmt.Errorf("SFTP not connected")
	}

	file, err := c.sftpClient.Open(remotePath)
	if err != nil {
		return "", fmt.Errorf("failed to open remote file: %w", err)
	}
	defer file.Close()

	// Check file size before reading
	stat, err := file.Stat()
	if err != nil {
		return "", fmt.Errorf("failed to stat remote file: %w", err)
	}

	const maxPreviewSize = 5 * 1024 * 1024 // 5MB
	if stat.Size() > maxPreviewSize {
		return "", fmt.Errorf("file too large to preview (>5MB)")
	}

	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read remote file: %w", err)
	}

	if binary {
		return base64.StdEncoding.EncodeToString(content), nil
	}
	return string(content), nil
}

func (c *Client) WriteFile(remotePath, content string) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	file, err := c.sftpClient.Create(remotePath)
	if err != nil {
		return fmt.Errorf("failed to create remote file: %w", err)
	}
	defer file.Close()

	if _, err := file.Write([]byte(content)); err != nil {
		return fmt.Errorf("failed to write remote file: %w", err)
	}

	return nil
}

func (c *Client) Chmod(path string, mode uint32) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}
	return c.sftpClient.Chmod(path, os.FileMode(mode))
}
