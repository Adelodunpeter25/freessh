package auth

import "golang.org/x/crypto/ssh"

type PasswordAuth struct {
	password string
}

func (p *PasswordAuth) GetAuthMethod() (ssh.AuthMethod, error) {
	return ssh.Password(p.password), nil
}
