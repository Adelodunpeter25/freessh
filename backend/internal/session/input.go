package session

func (m *Manager) SendInput(sessionID string, data []byte) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	_, err = session.Terminal.Write(data)
	return err
}

func (m *Manager) ResizeTerminal(sessionID string, rows, cols int) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	return session.Terminal.Resize(rows, cols)
}
