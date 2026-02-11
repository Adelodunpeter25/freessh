package workspace

import "errors"

var (
	ErrWorkspaceNotFound  = errors.New("workspace not found")
	ErrWindowNotFound     = errors.New("window not found")
	ErrTabNotFound        = errors.New("tab not found")
	ErrOwnershipMismatch  = errors.New("tab ownership mismatch")
	ErrSameWindowTransfer = errors.New("source and target windows are the same")
	ErrFeatureDisabled    = errors.New("workspace feature disabled")
)
