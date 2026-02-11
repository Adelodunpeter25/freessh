package workspace

import (
	"fmt"
	"time"
)

func (m *Manager) MoveTab(req TransferRequest) (TransferResult, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.enabled {
		return TransferResult{}, ErrFeatureDisabled
	}

	if req.SourceWindow == req.TargetWindow {
		return TransferResult{}, ErrSameWindowTransfer
	}

	if _, ok := m.windowMode[req.SourceWindow]; !ok {
		return TransferResult{}, ErrWindowNotFound
	}

	if _, ok := m.windowMode[req.TargetWindow]; !ok {
		return TransferResult{}, ErrWindowNotFound
	}

	ref, ok := m.tabOwners[req.TabID]
	if !ok {
		return TransferResult{}, ErrTabNotFound
	}

	if ref.WindowID != req.SourceWindow {
		return TransferResult{}, ErrOwnershipMismatch
	}

	now := time.Now().UTC()
	if req.TransactionID == "" {
		req.TransactionID = fmt.Sprintf("tx-%d", now.UnixNano())
	}

	ref.WindowID = req.TargetWindow
	ref.ModifiedAt = now
	m.tabOwners[req.TabID] = ref

	return TransferResult{
		TransactionID: req.TransactionID,
		TabID:         req.TabID,
		SourceWindow:  req.SourceWindow,
		TargetWindow:  req.TargetWindow,
		CompletedAt:   now,
	}, nil
}
