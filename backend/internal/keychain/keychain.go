package keychain

import "github.com/zalando/go-keyring"

const serviceName = "FreeSSH"

type Keychain struct{}

func New() *Keychain {
	return &Keychain{}
}

func (k *Keychain) Set(account, password string) error {
	return keyring.Set(serviceName, account, password)
}

func (k *Keychain) Get(account string) (string, error) {
	return keyring.Get(serviceName, account)
}

func (k *Keychain) Delete(account string) error {
	return keyring.Delete(serviceName, account)
}
