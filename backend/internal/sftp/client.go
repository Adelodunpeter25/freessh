package sftp

import (
	"fmt"
	"freessh-backend/internal/ssh"

	"github.com/pkg/sftp"
)

type Client struct {
	sshClient  *ssh.Client
	sftpClient *sftp.Client
}

func NewClient(sshClient *ssh.Client) *Client {
	return &Client{
		sshClient: sshClient,
	}
}

func (c *Client) Connect() error {
	if !c.sshClient.IsConnected() {
		return fmt.Errorf("SSH not connected")
	}

	sftpClient, err := sftp.NewClient(c.sshClient.GetSSHClient())
	if err != nil {
		return fmt.Errorf("failed to create SFTP client: %w", err)
	}

	c.sftpClient = sftpClient
	return nil
}

func (c *Client) Close() error {
	if c.sftpClient != nil {
		return c.sftpClient.Close()
	}
	return nil
}

func (c *Client) IsConnected() bool {
	return c.sftpClient != nil
}

func (c *Client) checkConnection() bool {
	if c.sftpClient == nil {
		return false
	}
	_, err := c.sftpClient.Getwd()
	if err != nil {
		c.sftpClient = nil
		return false
	}
	return true
}

func (c *Client) GetClient() *sftp.Client {
	return c.sftpClient
}

func (c *Client) GetHomeDir() (string, error) {
	if !c.IsConnected() {
		return "", fmt.Errorf("SFTP not connected")
	}
	return c.sftpClient.Getwd()
}
