package session

import (
	"context"
	"io"
)

func (m *Manager) readOutput(as *ActiveSession) {
	io := as.Terminal.GetIO()
	stdout := io.GetStdout()
	stderr := io.GetStderr()

	ctx, cancel := context.WithCancel(context.Background())
	as.cancelOutput = cancel

	go m.pipeOutput(ctx, as, stdout)
	go m.pipeOutput(ctx, as, stderr)
}

func (m *Manager) readLocalOutput(as *ActiveSession) {
	io := as.LocalTerminal.Read()
	reader := io.Read()

	ctx, cancel := context.WithCancel(context.Background())
	as.cancelOutput = cancel

	go m.pipeOutput(ctx, as, reader)
}

func (m *Manager) pipeOutput(ctx context.Context, as *ActiveSession, reader io.Reader) {
	buf := make([]byte, 8192)
	for {
		select {
		case <-ctx.Done():
			return
		case <-as.stopChan:
			return
		default:
			// Use context with timeout for read operation
			readDone := make(chan struct{})
			var n int
			var err error

			go func() {
				n, err = reader.Read(buf)
				close(readDone)
			}()

			select {
			case <-ctx.Done():
				return
			case <-readDone:
				if err != nil {
					if err != io.EOF {
						select {
						case <-as.stopChan:
							return
						case as.ErrorChan <- err:
						}
					}
					return
				}
				if n > 0 {
					data := make([]byte, n)
					copy(data, buf[:n])

					// Write to log file if logging is active
					as.logMutex.Lock()
					if as.isLogging && as.logFile != nil {
						as.logFile.Write(data)
					}
					as.logMutex.Unlock()

					select {
					case <-as.stopChan:
						return
					case as.OutputChan <- data:
					}
				}
			}
		}
	}
}
