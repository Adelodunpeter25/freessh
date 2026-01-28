package models

type KnownHost struct {
	ID          string    `json:"id"`
	Hostname    string    `json:"hostname"`
	Port        int       `json:"port"`
	Fingerprint string    `json:"fingerprint"`
	PublicKey   string    `json:"publicKey"`
}

type HostKeyVerification struct {
	Status      string `json:"status"` // "new", "known", "changed"
	Hostname    string `json:"hostname"`
	Port        int    `json:"port"`
	Fingerprint string `json:"fingerprint"`
	KeyType     string `json:"keyType"`
	OldFingerprint string `json:"oldFingerprint,omitempty"`
}
