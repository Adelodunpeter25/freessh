package auth

import "golang.org/x/crypto/ssh"

type KeyboardAuth struct {
	password string
}

func (k *KeyboardAuth) GetAuthMethod() (ssh.AuthMethod, error) {
	return ssh.KeyboardInteractive(func(user, instruction string, questions []string, echos []bool) ([]string, error) {
		answers := make([]string, len(questions))
		for i := range questions {
			answers[i] = k.password
		}
		return answers, nil
	}), nil
}
