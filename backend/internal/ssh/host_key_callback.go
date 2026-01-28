package ssh

import (
	"encoding/base64"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"net"

	"golang.org/x/crypto/ssh"
)

type HostKeyVerifier struct {
	storage *storage.KnownHostStorage
}

func NewHostKeyVerifier(storage *storage.KnownHostStorage) *HostKeyVerifier {
	return &HostKeyVerifier{
		storage: storage,
	}
}

func (v *HostKeyVerifier) VerifyHostKey(hostname string, port int, remote net.Addr, key ssh.PublicKey) (*models.HostKeyVerification, error) {
	fingerprint := ssh.FingerprintSHA256(key)
	keyType := key.Type()

	// Check if host is known
	knownHost := v.storage.Get(hostname, port)

	if knownHost == nil {
		// New host - return verification request
		return &models.HostKeyVerification{
			Status:      "new",
			Hostname:    hostname,
			Port:        port,
			Fingerprint: fingerprint,
			KeyType:     keyType,
		}, nil
	}

	// Host is known - verify fingerprint
	if knownHost.Fingerprint == fingerprint {
		// Update last seen
		knownHost.LastSeen = knownHost.LastSeen
		v.storage.Update(knownHost)
		
		return &models.HostKeyVerification{
			Status:      "known",
			Hostname:    hostname,
			Port:        port,
			Fingerprint: fingerprint,
			KeyType:     keyType,
		}, nil
	}

	// Fingerprint changed - security warning
	return &models.HostKeyVerification{
		Status:         "changed",
		Hostname:       hostname,
		Port:           port,
		Fingerprint:    fingerprint,
		KeyType:        keyType,
		OldFingerprint: knownHost.Fingerprint,
	}, fmt.Errorf("host key verification failed: fingerprint changed")
}

func (v *HostKeyVerifier) TrustHost(hostname string, port int, key ssh.PublicKey) error {
	fingerprint := ssh.FingerprintSHA256(key)
	keyType := key.Type()
	publicKeyStr := base64.StdEncoding.EncodeToString(key.Marshal())

	// Check if already exists
	existing := v.storage.Get(hostname, port)
	if existing != nil {
		// Update existing
		existing.Fingerprint = fingerprint
		existing.KeyType = keyType
		existing.PublicKey = publicKeyStr
		return v.storage.Update(existing)
	}

	// Add new
	host := &models.KnownHost{
		Hostname:    hostname,
		Port:        port,
		KeyType:     keyType,
		Fingerprint: fingerprint,
		PublicKey:   publicKeyStr,
	}
	return v.storage.Add(host)
}

func (v *HostKeyVerifier) CreateCallback(hostname string, port int, onVerification func(*models.HostKeyVerification) error) ssh.HostKeyCallback {
	return func(h string, remote net.Addr, key ssh.PublicKey) error {
		verification, err := v.VerifyHostKey(hostname, port, remote, key)
		
		if verification.Status == "known" {
			// Auto-accept known hosts
			return nil
		}

		// For new or changed hosts, call verification handler
		if onVerification != nil {
			if err := onVerification(verification); err != nil {
				return err
			}
		}

		// If verification handler didn't error, trust the host
		if verification.Status == "new" {
			return v.TrustHost(hostname, port, key)
		}

		// For changed keys, return error (handler should have dealt with it)
		if err != nil {
			return err
		}

		return nil
	}
}
