package models

const (
	MsgWorkspaceRegisterWindow MessageType = "workspace:register_window"
	MsgWorkspaceRemoveWindow   MessageType = "workspace:remove_window"
	MsgWorkspaceCreate         MessageType = "workspace:create"
	MsgWorkspaceGetByWindow    MessageType = "workspace:get_by_window"
	MsgWorkspaceRegisterTab    MessageType = "workspace:register_tab"
	MsgWorkspaceRemoveTab      MessageType = "workspace:remove_tab"
	MsgWorkspaceListTabs       MessageType = "workspace:list_tabs"
	MsgWorkspaceMoveTab        MessageType = "workspace:move_tab"
	MsgWorkspaceStateSave      MessageType = "workspace_state:save"
	MsgWorkspaceStateLoad      MessageType = "workspace_state:load"
	MsgWorkspaceStateClear     MessageType = "workspace_state:clear"
)
