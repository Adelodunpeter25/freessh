package keygen

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"

	"golang.org/x/crypto/ssh"
)

type KeyType string

const (
	KeyTypeRSA     KeyType = "rsa"
	KeyTypeEd25519 KeyType = "ed25519"
)

type KeyPair struct {
	PrivateKey string
	PublicKey  string
	Fingerprint string
}

func GenerateKeyPair(keyType KeyType, keySize int, comment string) (*KeyPair, error) {
	switch keyType {
	case KeyTypeRSA:
		return generateRSA(keySize, comment)
	case KeyTypeEd25519:
		return generateEd25519(comment)
	default:
		return nil, fmt.Errorf("unsupported key type: %s", keyType)
	}
}

func generateRSA(bits int, comment string) (*KeyPair, error) {
	if bits < 2048 {
		bits = 2048
	}
	
	privateKey, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, fmt.Errorf("failed to generate RSA key: %w", err)
	}

	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(privateKey),
	})

	publicKey, err := ssh.NewPublicKey(&privateKey.PublicKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create public key: %w", err)
	}

	publicKeyStr := string(ssh.MarshalAuthorizedKey(publicKey))
	if comment != "" {
		publicKeyStr = publicKeyStr[:len(publicKeyStr)-1] + " " + comment + "\n"
	}

	fingerprint := ssh.FingerprintSHA256(publicKey)

	return &KeyPair{
		PrivateKey:  string(privateKeyPEM),
		PublicKey:   publicKeyStr,
		Fingerprint: fingerprint,
	}, nil
}

func generateEd25519(comment string) (*KeyPair, error) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("failed to generate Ed25519 key: %w", err)
	}

	privateKeyBytes, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal private key: %w", err)
	}

	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PRIVATE KEY",
		Bytes: privateKeyBytes,
	})

	sshPublicKey, err := ssh.NewPublicKey(publicKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create public key: %w", err)
	}

	publicKeyStr := string(ssh.MarshalAuthorizedKey(sshPublicKey))
	if comment != "" {
		publicKeyStr = publicKeyStr[:len(publicKeyStr)-1] + " " + comment + "\n"
	}

	fingerprint := ssh.FingerprintSHA256(sshPublicKey)

	return &KeyPair{
		PrivateKey:  string(privateKeyPEM),
		PublicKey:   publicKeyStr,
		Fingerprint: fingerprint,
	}, nil
}
