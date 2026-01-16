package auth

import (
	"fmt"

	"golang.org/x/crypto/ssh"
)

type PublicKeyAuth struct {
	privateKey string
	passphrase string
}

func (p *PublicKeyAuth) GetAuthMethod() (ssh.AuthMethod, error) {
	var signer ssh.Signer
	var err error

	if p.passphrase != "" {
		signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(p.privateKey), []byte(p.passphrase))
	} else {
		signer, err = ssh.ParsePrivateKey([]byte(p.privateKey))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	return ssh.PublicKeys(signer), nil
}
