package auth

import (
	"freessh-backend/internal/models"

	"golang.org/x/crypto/ssh"
)

type Provider interface {
	GetAuthMethod() (ssh.AuthMethod, error)
}

func NewProvider(config models.ConnectionConfig) Provider {
	switch config.AuthMethod {
	case models.AuthPassword:
		return &PasswordAuth{password: config.Password}
	case models.AuthPublicKey:
		return &PublicKeyAuth{
			privateKey: config.PrivateKey,
			passphrase: config.Passphrase,
		}
	default:
		return &PasswordAuth{password: config.Password}
	}
}
