package session

func (m *Manager) ReadFile(sessionID, path string, binary bool) (string, error) {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return "", err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return "", err
		}
	}

	content, err := session.SFTPClient.ReadFile(path, binary)
	if err != nil && !session.SFTPClient.IsConnected() {
		// Reconnect and retry once
		if err := session.SFTPClient.Connect(); err != nil {
			return "", err
		}
		return session.SFTPClient.ReadFile(path, binary)
	}
	return content, err
}

func (m *Manager) WriteFile(sessionID, path, content string) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if !session.SFTPClient.IsConnected() {
		if err := session.SFTPClient.Connect(); err != nil {
			return err
		}
	}

	return session.SFTPClient.WriteFile(path, content)
}

func (m *Manager) Chmod(sessionID, path string, mode uint32) error {
	client, err := m.ensureSFTP(sessionID)
	if err != nil {
		return err
	}
	return client.Chmod(path, mode)
}
