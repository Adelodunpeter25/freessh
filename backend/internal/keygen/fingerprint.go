package keygen

import (
	"fmt"

	"golang.org/x/crypto/ssh"
)

func GetFingerprint(publicKeyStr string) (string, error) {
	publicKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(publicKeyStr))
	if err != nil {
		return "", fmt.Errorf("failed to parse public key: %w", err)
	}

	return ssh.FingerprintSHA256(publicKey), nil
}
