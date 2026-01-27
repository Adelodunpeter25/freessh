package models

type AuthMethod string

const (
	AuthPassword  AuthMethod = "password"
	AuthPublicKey AuthMethod = "publickey"
)

type ConnectionConfig struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Host       string     `json:"host"`
	Port       int        `json:"port"`
	Username   string     `json:"username"`
	AuthMethod AuthMethod `json:"auth_method"`
	PrivateKey string     `json:"private_key,omitempty"`
	Group      string     `json:"group,omitempty"`
	
	// Runtime-only fields (not persisted to JSON)
	Password   string `json:"-"`
	Passphrase string `json:"-"`
}
