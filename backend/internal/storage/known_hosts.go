package storage

import (
	"encoding/json"
	"fmt"
	"freessh-backend/internal/models"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
)

type KnownHostStorage struct {
	filePath string
	hosts    map[string]*models.KnownHost
	mu       sync.RWMutex
}

func NewKnownHostStorage() (*KnownHostStorage, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	freesshDir := filepath.Join(homeDir, ".freessh")
	if err := os.MkdirAll(freesshDir, 0700); err != nil {
		return nil, fmt.Errorf("failed to create .freessh directory: %w", err)
	}

	filePath := filepath.Join(freesshDir, "known_hosts.json")
	storage := &KnownHostStorage{
		filePath: filePath,
		hosts:    make(map[string]*models.KnownHost),
	}

	if err := storage.load(); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *KnownHostStorage) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to read known_hosts file: %w", err)
	}

	var hosts []*models.KnownHost
	if err := json.Unmarshal(data, &hosts); err != nil {
		return fmt.Errorf("failed to parse known_hosts: %w", err)
	}

	for _, host := range hosts {
		s.hosts[host.ID] = host
	}

	return nil
}

func (s *KnownHostStorage) save() error {
	hosts := make([]*models.KnownHost, 0, len(s.hosts))
	for _, host := range s.hosts {
		hosts = append(hosts, host)
	}

	data, err := json.MarshalIndent(hosts, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal known_hosts: %w", err)
	}

	if err := os.WriteFile(s.filePath, data, 0600); err != nil {
		return fmt.Errorf("failed to write known_hosts file: %w", err)
	}

	return nil
}

func (s *KnownHostStorage) GetAll() []*models.KnownHost {
	s.mu.RLock()
	defer s.mu.RUnlock()

	hosts := make([]*models.KnownHost, 0, len(s.hosts))
	for _, host := range s.hosts {
		hosts = append(hosts, host)
	}
	return hosts
}

func (s *KnownHostStorage) Get(hostname string, port int) *models.KnownHost {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, host := range s.hosts {
		if host.Hostname == hostname && host.Port == port {
			return host
		}
	}
	return nil
}

func (s *KnownHostStorage) Add(host *models.KnownHost) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if host.ID == "" {
		host.ID = uuid.New().String()
	}
	if host.FirstSeen.IsZero() {
		host.FirstSeen = time.Now()
	}
	host.LastSeen = time.Now()

	s.hosts[host.ID] = host
	return s.save()
}

func (s *KnownHostStorage) Update(host *models.KnownHost) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.hosts[host.ID]; !exists {
		return fmt.Errorf("host not found")
	}

	host.LastSeen = time.Now()
	s.hosts[host.ID] = host
	return s.save()
}

func (s *KnownHostStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.hosts[id]; !exists {
		return fmt.Errorf("host not found")
	}

	delete(s.hosts, id)
	return s.save()
}

func (s *KnownHostStorage) DeleteByHostname(hostname string, port int) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for id, host := range s.hosts {
		if host.Hostname == hostname && host.Port == port {
			delete(s.hosts, id)
			return s.save()
		}
	}
	return fmt.Errorf("host not found")
}
