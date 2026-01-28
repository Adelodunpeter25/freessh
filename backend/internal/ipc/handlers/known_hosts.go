package handlers

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"freessh-backend/internal/models"
	"freessh-backend/internal/storage"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/crypto/ssh"
)

type KnownHostsHandler struct {
	storage *storage.KnownHostStorage
}

func NewKnownHostsHandler(storage *storage.KnownHostStorage) *KnownHostsHandler {
	return &KnownHostsHandler{
		storage: storage,
	}
}

func (h *KnownHostsHandler) CanHandle(msgType models.MessageType) bool {
	switch msgType {
	case models.MsgKnownHostList, models.MsgKnownHostRemove, models.MsgKnownHostTrust, models.MsgKnownHostImport:
		return true
	}
	return false
}

func (h *KnownHostsHandler) Handle(msg *models.IPCMessage, writer ResponseWriter) error {
	switch msg.Type {
	case models.MsgKnownHostList:
		return h.handleList(msg, writer)
	case models.MsgKnownHostRemove:
		return h.handleRemove(msg, writer)
	case models.MsgKnownHostTrust:
		return h.handleTrust(msg, writer)
	case models.MsgKnownHostImport:
		return h.handleImport(msg, writer)
	default:
		return fmt.Errorf("unsupported message type: %s", msg.Type)
	}
}

func (h *KnownHostsHandler) handleList(msg *models.IPCMessage, writer ResponseWriter) error {
	hosts := h.storage.GetAll()
	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostList,
		Data: hosts,
	})
}

func (h *KnownHostsHandler) handleRemove(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	id, _ := dataMap["id"].(string)
	if id == "" {
		return fmt.Errorf("id required")
	}

	if err := h.storage.Delete(id); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostRemove,
		Data: map[string]string{"status": "removed", "id": id},
	})
}

func (h *KnownHostsHandler) handleTrust(msg *models.IPCMessage, writer ResponseWriter) error {
	dataMap, ok := msg.Data.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid data format")
	}

	hostname, _ := dataMap["hostname"].(string)
	port, _ := dataMap["port"].(float64)
	fingerprint, _ := dataMap["fingerprint"].(string)
	publicKey, _ := dataMap["publicKey"].(string)

	if hostname == "" || port == 0 || fingerprint == "" {
		return fmt.Errorf("hostname, port, and fingerprint required")
	}

	host := &models.KnownHost{
		Hostname:    hostname,
		Port:        int(port),
		Fingerprint: fingerprint,
		PublicKey:   publicKey,
	}

	if err := h.storage.Add(host); err != nil {
		return err
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostTrust,
		Data: map[string]string{"status": "trusted", "hostname": hostname},
	})
}

func (h *KnownHostsHandler) handleImport(msg *models.IPCMessage, writer ResponseWriter) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home directory: %w", err)
	}

	knownHostsPath := filepath.Join(homeDir, ".ssh", "known_hosts")
	file, err := os.Open(knownHostsPath)
	if err != nil {
		return fmt.Errorf("failed to open known_hosts file: %w", err)
	}
	defer file.Close()

	imported := 0
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.Fields(line)
		if len(parts) < 3 {
			continue
		}

		// Parse hostname (may include port like [hostname]:port)
		hostPart := parts[0]
		hostname := hostPart
		port := 22

		if strings.HasPrefix(hostPart, "[") && strings.Contains(hostPart, "]:") {
			// Format: [hostname]:port
			endBracket := strings.Index(hostPart, "]:")
			if endBracket > 0 {
				hostname = hostPart[1:endBracket]
				fmt.Sscanf(hostPart[endBracket+2:], "%d", &port)
			}
		}

		// Parse public key
		keyData := parts[2]

		keyBytes, err := base64.StdEncoding.DecodeString(keyData)
		if err != nil {
			continue
		}

		pubKey, err := ssh.ParsePublicKey(keyBytes)
		if err != nil {
			continue
		}

		fingerprint := ssh.FingerprintSHA256(pubKey)

		// Check if already exists
		if h.storage.Get(hostname, port) != nil {
			continue
		}

		host := &models.KnownHost{
			Hostname:    hostname,
			Port:        port,
			Fingerprint: fingerprint,
			PublicKey:   keyData,
		}

		if err := h.storage.Add(host); err == nil {
			imported++
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading known_hosts: %w", err)
	}

	return writer.WriteMessage(&models.IPCMessage{
		Type: models.MsgKnownHostImport,
		Data: map[string]interface{}{"status": "imported", "count": imported},
	})
}
