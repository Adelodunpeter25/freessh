package models

import "time"

type KnownHost struct {
	ID          string    `json:"id"`
	Hostname    string    `json:"hostname"`
	Port        int       `json:"port"`
	KeyType     string    `json:"keyType"`
	Fingerprint string    `json:"fingerprint"`
	PublicKey   string    `json:"publicKey"`
	FirstSeen   time.Time `json:"firstSeen"`
	LastSeen    time.Time `json:"lastSeen"`
}

type HostKeyVerification struct {
	Status      string `json:"status"` // "new", "known", "changed"
	Hostname    string `json:"hostname"`
	Port        int    `json:"port"`
	Fingerprint string `json:"fingerprint"`
	KeyType     string `json:"keyType"`
	OldFingerprint string `json:"oldFingerprint,omitempty"`
}
