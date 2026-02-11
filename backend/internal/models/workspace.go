package models

type WorkspaceModel struct {
	ID        string `json:"id"`
	WindowID  string `json:"window_id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type WorkspaceTabModel struct {
	TabID      string `json:"tab_id"`
	SessionID  string `json:"session_id"`
	WindowID   string `json:"window_id"`
	IsLocal    bool   `json:"is_local"`
	CreatedAt  string `json:"created_at"`
	ModifiedAt string `json:"modified_at"`
}

type WorkspaceRegisterWindowRequest struct {
	WindowID string `json:"window_id"`
	Mode     string `json:"mode"`
}

type WorkspaceRemoveWindowRequest struct {
	WindowID string `json:"window_id"`
}

type WorkspaceCreateRequest struct {
	WindowID string `json:"window_id"`
	Name     string `json:"name"`
}

type WorkspaceGetByWindowRequest struct {
	WindowID string `json:"window_id"`
}

type WorkspaceRegisterTabRequest struct {
	TabID     string `json:"tab_id"`
	SessionID string `json:"session_id"`
	WindowID  string `json:"window_id"`
	IsLocal   bool   `json:"is_local"`
}

type WorkspaceRemoveTabRequest struct {
	TabID string `json:"tab_id"`
}

type WorkspaceListTabsRequest struct {
	WindowID string `json:"window_id"`
}

type WorkspaceMoveTabRequest struct {
	TabID         string `json:"tab_id"`
	SourceWindow  string `json:"source_window"`
	TargetWindow  string `json:"target_window"`
	TransactionID string `json:"transaction_id,omitempty"`
}

type WorkspaceRegisterWindowResponse struct {
	Status string `json:"status"`
}

type WorkspaceRemoveWindowResponse struct {
	Status string `json:"status"`
}

type WorkspaceCreateResponse struct {
	Workspace WorkspaceModel `json:"workspace"`
}

type WorkspaceGetByWindowResponse struct {
	Workspace WorkspaceModel `json:"workspace"`
}

type WorkspaceRegisterTabResponse struct {
	Status string `json:"status"`
}

type WorkspaceRemoveTabResponse struct {
	Status string `json:"status"`
}

type WorkspaceListTabsResponse struct {
	Tabs []WorkspaceTabModel `json:"tabs"`
}

type WorkspaceMoveTabResponse struct {
	TransactionID string `json:"transaction_id"`
	TabID         string `json:"tab_id"`
	SourceWindow  string `json:"source_window"`
	TargetWindow  string `json:"target_window"`
	CompletedAt   string `json:"completed_at"`
}
