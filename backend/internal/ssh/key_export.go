package ssh

import (
	"fmt"
	"freessh-backend/internal/keychain"
	"freessh-backend/internal/models"

	"golang.org/x/crypto/ssh"
)

func ExportKeyToConnection(config models.ConnectionConfig, publicKey string, generatedPrivateKey string) error {
	kc := keychain.New()
	clientConfig := &ssh.ClientConfig{
		User:            config.Username,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         0,
	}

	// Get credentials from keychain
	if config.AuthMethod == "password" {
		password, err := kc.Get(config.ID + ":password")
		if err != nil || password == "" {
			return fmt.Errorf("password not found in keychain - please save connection credentials first")
		}
		clientConfig.Auth = []ssh.AuthMethod{
			ssh.Password(password),
		}
	} else if config.AuthMethod == "key" && config.PrivateKey != "" {
		passphrase, _ := kc.Get(config.ID + ":passphrase")
		
		var signer ssh.Signer
		var err error
		if passphrase != "" {
			signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(config.PrivateKey), []byte(passphrase))
		} else {
			signer, err = ssh.ParsePrivateKey([]byte(config.PrivateKey))
		}
		if err != nil {
			return fmt.Errorf("failed to parse private key: %w", err)
		}
		clientConfig.Auth = []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		}
	} else {
		return fmt.Errorf("no valid authentication method configured for this connection")
	}

	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	client, err := ssh.Dial("tcp", addr, clientConfig)
	if err != nil {
		return fmt.Errorf("failed to connect: %w", err)
	}
	defer client.Close()

	sshSession, err := client.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer sshSession.Close()

	cmd := fmt.Sprintf("mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '%s' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys", publicKey)

	if err := sshSession.Run(cmd); err != nil {
		return fmt.Errorf("failed to export key: %w", err)
	}

	return nil
}
