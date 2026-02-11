package workspace

import "time"

type WorkspaceID string
type WindowID string
type TabID string
type SessionID string

type WindowMode string

const (
	WindowModePrimary   WindowMode = "primary"
	WindowModeWorkspace WindowMode = "workspace"
)

type Workspace struct {
	ID        WorkspaceID
	WindowID  WindowID
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type TabRef struct {
	TabID      TabID
	SessionID  SessionID
	WindowID   WindowID
	IsLocal    bool
	CreatedAt  time.Time
	ModifiedAt time.Time
}

type TransferRequest struct {
	TabID         TabID
	SourceWindow  WindowID
	TargetWindow  WindowID
	RequestedAt   time.Time
	TransactionID string
}

type TransferResult struct {
	TransactionID string
	TabID         TabID
	SourceWindow  WindowID
	TargetWindow  WindowID
	CompletedAt   time.Time
}
