package ssh

import (
	"fmt"
)

func ExportKeyToHost(client *Client, publicKey string) error {
	sshSession, err := client.sshClient.NewSession()
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
