package ssh

import (
	"fmt"
	"freessh-backend/internal/config"
	"freessh-backend/internal/models"
	"freessh-backend/internal/ssh/auth"
	"net"

	"golang.org/x/crypto/ssh"
)

type Client struct {
	config    models.ConnectionConfig
	sshClient *ssh.Client
	sshConfig *ssh.ClientConfig
}

func NewClient(connConfig models.ConnectionConfig) *Client {
	return &Client{
		config: connConfig,
	}
}

func (c *Client) Connect() error {
	authProvider := auth.NewProvider(c.config)
	authMethod, err := authProvider.GetAuthMethod()
	if err != nil {
		return fmt.Errorf("auth failed: %w", err)
	}

	c.sshConfig = &ssh.ClientConfig{
		User:            c.config.Username,
		Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         config.DefaultTimeout,
	}

	addr := fmt.Sprintf("%s:%d", c.config.Host, c.config.Port)
	conn, err := net.DialTimeout("tcp", addr, config.DefaultTimeout)
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}

	sshConn, chans, reqs, err := ssh.NewClientConn(conn, addr, c.sshConfig)
	if err != nil {
		conn.Close()
		return fmt.Errorf("ssh handshake failed: %w", err)
	}

	c.sshClient = ssh.NewClient(sshConn, chans, reqs)
	return nil
}

func (c *Client) Disconnect() error {
	if c.sshClient != nil {
		return c.sshClient.Close()
	}
	return nil
}

func (c *Client) NewSession() (*ssh.Session, error) {
	if c.sshClient == nil {
		return nil, fmt.Errorf("not connected")
	}
	return c.sshClient.NewSession()
}

func (c *Client) IsConnected() bool {
	return c.sshClient != nil
}

func (c *Client) GetSSHClient() *ssh.Client {
	return c.sshClient
}
