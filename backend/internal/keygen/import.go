package keygen

import (
	"crypto/ed25519"
	"crypto/rsa"
	"fmt"

	"golang.org/x/crypto/ssh"
)

// ImportKeyResult contains parsed key information
type ImportKeyResult struct {
	Algorithm string
	Bits      int
	PublicKey string
}

// ParsePrivateKey parses a private key and extracts public key information
func ParsePrivateKey(privateKeyPEM string, passphrase string) (*ImportKeyResult, error) {
	var signer ssh.Signer
	var err error

	// Try parsing with passphrase if provided
	if passphrase != "" {
		signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(privateKeyPEM), []byte(passphrase))
	} else {
		signer, err = ssh.ParsePrivateKey([]byte(privateKeyPEM))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	// Extract public key
	publicKey := signer.PublicKey()
	publicKeyStr := string(ssh.MarshalAuthorizedKey(publicKey))

	// Determine algorithm and key size
	result := &ImportKeyResult{
		PublicKey: publicKeyStr,
		Algorithm: publicKey.Type(),
	}

	// Try to get bit size for RSA keys
	if cryptoPubKey, ok := publicKey.(ssh.CryptoPublicKey); ok {
		if rsaKey, ok := cryptoPubKey.CryptoPublicKey().(*rsa.PublicKey); ok {
			result.Algorithm = "rsa"
			result.Bits = rsaKey.N.BitLen()
		} else if _, ok := cryptoPubKey.CryptoPublicKey().(ed25519.PublicKey); ok {
			result.Algorithm = "ed25519"
		}
	}

	return result, nil
}
