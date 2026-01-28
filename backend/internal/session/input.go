package session

func (m *Manager) SendInput(sessionID string, data []byte) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if session.LocalTerminal != nil {
		_, err = session.LocalTerminal.Write(data)
	} else {
		_, err = session.Terminal.Write(data)
	}
	return err
}

func (m *Manager) ResizeTerminal(sessionID string, rows, cols int) error {
	session, err := m.GetSession(sessionID)
	if err != nil {
		return err
	}

	if session.LocalTerminal != nil {
		return session.LocalTerminal.Resize(rows, cols)
	}
	return session.Terminal.Resize(rows, cols)
}
