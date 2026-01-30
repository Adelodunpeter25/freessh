package connection

import (
	"fmt"
	"freessh-backend/internal/keygen"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"time"

	"github.com/google/uuid"
)

// MigrateEmbeddedKey checks if a connection has an embedded private key and migrates it to key storage
func MigrateEmbeddedKey(config *models.ConnectionConfig, keyStorage *storage.KeyStorage, fileStorage *storage.KeyFileStorage) error {
	// Skip if no embedded key or already using KeyID
	if config.PrivateKey == "" || config.KeyID != "" {
		return nil
	}

	// Parse the private key to extract metadata and validate it
	result, err := keygen.ParsePrivateKey(config.PrivateKey, "")
	if err != nil {
		return fmt.Errorf("failed to parse private key: %w", err)
	}

	// Check if this key already exists (compare public keys)
	existingKeys := keyStorage.List()
	for _, existingKey := range existingKeys {
		if existingKey.PublicKey == result.PublicKey {
			// Key already exists, just reference it
			config.KeyID = existingKey.ID
			config.PrivateKey = ""
			return nil
		}
	}

	// Create new key entry
	keyID := uuid.New().String()
	key := models.SSHKey{
		ID:        keyID,
		Name:      fmt.Sprintf("Key for %s", config.Name),
		Algorithm: result.Algorithm,
		Bits:      result.Bits,
		PublicKey: result.PublicKey,
		CreatedAt: time.Now(),
	}

	// Save private key to file
	if err := fileStorage.SavePrivateKey(keyID, config.PrivateKey); err != nil {
		return fmt.Errorf("failed to save private key: %w", err)
	}

	// Save key metadata
	if err := keyStorage.Save(key); err != nil {
		return fmt.Errorf("failed to save key metadata: %w", err)
	}

	// Update connection to use KeyID
	config.KeyID = keyID
	config.PrivateKey = ""

	return nil
}
