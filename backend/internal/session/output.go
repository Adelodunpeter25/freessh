package session

import "io"

func (m *Manager) readOutput(as *ActiveSession) {
	io := as.Terminal.GetIO()
	stdout := io.GetStdout()
	stderr := io.GetStderr()

	go m.pipeOutput(as, stdout)
	go m.pipeOutput(as, stderr)
}

func (m *Manager) readLocalOutput(as *ActiveSession) {
	io := as.LocalTerminal.Read()
	reader := io.Read()
	go m.pipeOutput(as, reader)
}

func (m *Manager) pipeOutput(as *ActiveSession, reader io.Reader) {
	buf := make([]byte, 4096)
	for {
		select {
		case <-as.stopChan:
			return
		default:
			n, err := reader.Read(buf)
			if err != nil {
				if err != io.EOF {
					as.ErrorChan <- err
				}
				return
			}
			if n > 0 {
				data := make([]byte, n)
				copy(data, buf[:n])
				as.OutputChan <- data
			}
		}
	}
}
