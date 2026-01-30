package importpkg

import (
	"bufio"
	"fmt"
	"freessh-backend/internal/models"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

type OpenSSHHost struct {
	Alias        string
	HostName     string
	Port         int
	User         string
	IdentityFile string
}

func ParseOpenSSHConfig(data []byte) ([]OpenSSHHost, error) {
	var hosts []OpenSSHHost
	var currentHost *OpenSSHHost

	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		
		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Split into key and value
		parts := strings.Fields(line)
		if len(parts) < 2 {
			continue
		}

		key := strings.ToLower(parts[0])
		value := strings.Join(parts[1:], " ")

		switch key {
		case "host":
			// Save previous host if exists
			if currentHost != nil {
				hosts = append(hosts, *currentHost)
			}
			// Start new host
			currentHost = &OpenSSHHost{
				Alias: value,
				Port:  22, // Default port
			}
		case "hostname":
			if currentHost != nil {
				currentHost.HostName = value
			}
		case "port":
			if currentHost != nil {
				if port, err := strconv.Atoi(value); err == nil {
					currentHost.Port = port
				}
			}
		case "user":
			if currentHost != nil {
				currentHost.User = value
			}
		case "identityfile":
			if currentHost != nil {
				// Expand ~ to home directory
				if strings.HasPrefix(value, "~/") {
					home, _ := os.UserHomeDir()
					value = filepath.Join(home, value[2:])
				}
				currentHost.IdentityFile = value
			}
		}
	}

	// Don't forget the last host
	if currentHost != nil {
		hosts = append(hosts, *currentHost)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return hosts, nil
}

func ConvertOpenSSHToConnection(host OpenSSHHost) models.ConnectionConfig {
	conn := models.ConnectionConfig{
		ID:         uuid.New().String(),
		Name:       host.Alias,
		Host:       host.HostName,
		Port:       host.Port,
		Username:   host.User,
		AuthMethod: models.AuthPassword, // Default to password
	}

	// If identity file is specified, use public key auth
	if host.IdentityFile != "" {
		conn.AuthMethod = models.AuthPublicKey
		// Note: The key file path is stored, but we'll need to import it separately
	}

	return conn
}
