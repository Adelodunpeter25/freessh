package workspace

import "time"

const StateVersion = 1

type PersistedState struct {
	Version     int                    `json:"version"`
	SavedAt     time.Time              `json:"saved_at"`
	Snapshot    Snapshot               `json:"snapshot"`
	ClientState map[string]interface{} `json:"client_state,omitempty"`
}
