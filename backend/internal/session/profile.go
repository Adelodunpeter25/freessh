package session

import (
	"fmt"
	"strings"
	"time"
)

func (m *Manager) applySessionProfile(activeSession *ActiveSession) {
	if activeSession == nil || activeSession.Config.Profile == nil {
		return
	}

	startupCommand := strings.TrimSpace(activeSession.Config.Profile.StartupCommand)
	if startupCommand == "" {
		return
	}

	delay := activeSession.Config.Profile.StartupCommandDelayMs
	if delay < 0 {
		delay = 0
	}
	if delay > 60000 {
		delay = 60000
	}

	go func(sessionID string, command string, delayMs int) {
		if delayMs > 0 {
			timer := time.NewTimer(time.Duration(delayMs) * time.Millisecond)
			defer timer.Stop()

			select {
			case <-timer.C:
			case <-activeSession.StopChannel():
				return
			}
		}

		payload := command
		if !strings.HasSuffix(payload, "\n") {
			payload += "\n"
		}

		if err := m.SendInput(sessionID, []byte(payload)); err != nil {
			select {
			case activeSession.ErrorChan <- fmt.Errorf("failed to run startup command: %w", err):
			default:
			}
		}
	}(activeSession.ID, startupCommand, delay)
}
