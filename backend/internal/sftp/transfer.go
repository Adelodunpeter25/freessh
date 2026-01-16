package sftp

import (
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

	buf := make([]byte, 32*1024)
	var transferred int64

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
		if progress != nil {
			progress(transferred, stat.Size())
		}
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

	buf := make([]byte, 32*1024)
	var transferred int64

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
		if progress != nil {
			progress(transferred, stat.Size())
		}
	}

	return nil
}

func (c *Client) ReadFile(remotePath string) (string, error) {
	if !c.IsConnected() {
		return "", fmt.Errorf("SFTP not connected")
	}

	file, err := c.sftpClient.Open(remotePath)
	if err != nil {
		return "", fmt.Errorf("failed to open remote file: %w", err)
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read remote file: %w", err)
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
