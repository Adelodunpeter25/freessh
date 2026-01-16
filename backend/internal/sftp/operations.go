package sftp

import (
	"fmt"
	"freessh-backend/internal/models"
)

func (c *Client) List(path string) ([]models.FileInfo, error) {
	if !c.IsConnected() {
		return nil, fmt.Errorf("SFTP not connected")
	}

	entries, err := c.sftpClient.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("failed to list directory: %w", err)
	}

	files := make([]models.FileInfo, 0, len(entries))
	for _, entry := range entries {
		files = append(files, models.FileInfo{
			Name:    entry.Name(),
			Path:    path + "/" + entry.Name(),
			Size:    entry.Size(),
			Mode:    uint32(entry.Mode()),
			ModTime: entry.ModTime().Unix(),
			IsDir:   entry.IsDir(),
		})
	}

	return files, nil
}

func (c *Client) Stat(path string) (*models.FileInfo, error) {
	if !c.IsConnected() {
		return nil, fmt.Errorf("SFTP not connected")
	}

	info, err := c.sftpClient.Stat(path)
	if err != nil {
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}

	return &models.FileInfo{
		Name:    info.Name(),
		Path:    path,
		Size:    info.Size(),
		Mode:    uint32(info.Mode()),
		ModTime: info.ModTime().Unix(),
		IsDir:   info.IsDir(),
	}, nil
}

func (c *Client) Mkdir(path string) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	return c.sftpClient.Mkdir(path)
}

func (c *Client) Remove(path string) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	return c.sftpClient.Remove(path)
}

func (c *Client) RemoveDirectory(path string) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	return c.sftpClient.RemoveDirectory(path)
}

func (c *Client) Rename(oldPath, newPath string) error {
	if !c.IsConnected() {
		return fmt.Errorf("SFTP not connected")
	}

	return c.sftpClient.Rename(oldPath, newPath)
}
