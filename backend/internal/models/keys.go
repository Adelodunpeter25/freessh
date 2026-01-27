package models

import "time"

type SSHKey struct {
	ID          string    `json:"id"`
	Fingerprint string    `json:"fingerprint"`
	Comment     string    `json:"comment,omitempty"`
	KeyType     string    `json:"key_type"`
	CreatedAt   time.Time `json:"created_at"`
}
