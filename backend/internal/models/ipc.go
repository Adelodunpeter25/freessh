package models

type MessageType string

const (
	MsgConnect       MessageType = "connect"
	MsgConnectLocal  MessageType = "connect_local"
	MsgDisconnect    MessageType = "disconnect"
	MsgInput         MessageType = "input"
	MsgOutput        MessageType = "output"
	MsgResize        MessageType = "resize"
	MsgError         MessageType = "error"
	MsgSessionStatus MessageType = "session_status"
	MsgSessionList   MessageType = "session_list"

	// Terminal logging messages
	MsgTerminalStartLogging  MessageType = "terminal:start_logging"
	MsgTerminalStopLogging   MessageType = "terminal:stop_logging"
	MsgTerminalLoggingStatus MessageType = "terminal:logging_status"

	// Log messages
	MsgLogList      MessageType = "log:list"
	MsgLogRead      MessageType = "log:read"
	MsgLogDelete    MessageType = "log:delete"
	MsgLogDeleteAll MessageType = "log:delete_all"

	// Log settings messages
	MsgLogSettingsGet    MessageType = "log_settings:get"
	MsgLogSettingsUpdate MessageType = "log_settings:update"

	// SFTP messages
	MsgSFTPList      MessageType = "sftp:list"
	MsgSFTPUpload    MessageType = "sftp:upload"
	MsgSFTPDownload  MessageType = "sftp:download"
	MsgSFTPDelete    MessageType = "sftp:delete"
	MsgSFTPMkdir     MessageType = "sftp:mkdir"
	MsgSFTPRename    MessageType = "sftp:rename"
	MsgSFTPProgress  MessageType = "sftp:progress"
	MsgSFTPCancel    MessageType = "sftp:cancel"
	MsgSFTPReadFile  MessageType = "sftp:readfile"
	MsgSFTPWriteFile MessageType = "sftp:writefile"
	MsgSFTPChmod     MessageType = "sftp:chmod"

	// Bulk operations messages
	MsgBulkDownload MessageType = "bulk:download"
	MsgBulkUpload   MessageType = "bulk:upload"
	MsgBulkDelete   MessageType = "bulk:delete"
	MsgBulkProgress MessageType = "bulk:progress"

	// Remote-to-remote transfer messages
	MsgRemoteTransfer     MessageType = "remote:transfer"
	MsgBulkRemoteTransfer MessageType = "bulk:remote:transfer"
	MsgRemoteProgress     MessageType = "remote:progress"
	MsgRemoteCancel       MessageType = "remote:cancel"

	// Port forwarding messages
	MsgPortForwardCreate MessageType = "portforward:create"
	MsgPortForwardStop   MessageType = "portforward:stop"
	MsgPortForwardList   MessageType = "portforward:list"

	// Port forwarding config messages
	MsgPortForwardConfigList   MessageType = "portforward_config:list"
	MsgPortForwardConfigGet    MessageType = "portforward_config:get"
	MsgPortForwardConfigCreate MessageType = "portforward_config:create"
	MsgPortForwardConfigUpdate MessageType = "portforward_config:update"
	MsgPortForwardConfigDelete MessageType = "portforward_config:delete"

	// Keychain messages
	MsgKeychainSet    MessageType = "keychain:set"
	MsgKeychainGet    MessageType = "keychain:get"
	MsgKeychainDelete MessageType = "keychain:delete"

	// Snippet messages
	MsgSnippetList   MessageType = "snippet:list"
	MsgSnippetCreate MessageType = "snippet:create"
	MsgSnippetUpdate MessageType = "snippet:update"
	MsgSnippetDelete MessageType = "snippet:delete"

	// History messages
	MsgHistoryList  MessageType = "history:list"
	MsgHistoryAdd   MessageType = "history:add"
	MsgHistoryClear MessageType = "history:clear"

	// Export messages
	MsgExportFreeSSH MessageType = "export:freessh"
	MsgExportOpenSSH MessageType = "export:openssh"

	// Import messages
	MsgImportFreeSSH MessageType = "import:freessh"
	MsgImportOpenSSH MessageType = "import:openssh"

	// Key generation messages
	MsgKeygenGenerate    MessageType = "keygen:generate"
	MsgKeygenFingerprint MessageType = "keygen:fingerprint"

	// Key storage messages
	MsgKeyList   MessageType = "key:list"
	MsgKeySave   MessageType = "key:save"
	MsgKeyImport MessageType = "key:import"
	MsgKeyUpdate MessageType = "key:update"
	MsgKeyDelete MessageType = "key:delete"
	MsgKeyExport MessageType = "key:export"

	// Known hosts messages
	MsgKnownHostList         MessageType = "known_host:list"
	MsgKnownHostRemove       MessageType = "known_host:remove"
	MsgKnownHostTrust        MessageType = "known_host:trust"
	MsgKnownHostImport       MessageType = "known_host:import"
	MsgHostKeyVerify         MessageType = "host_key:verify"
	MsgHostKeyVerifyResponse MessageType = "host_key:verify_response"

	// Group messages
	MsgGroupList   MessageType = "group:list"
	MsgGroupCreate MessageType = "group:create"
	MsgGroupRename MessageType = "group:rename"
	MsgGroupDelete MessageType = "group:delete"
)

type IPCMessage struct {
	Type      MessageType `json:"type"`
	RequestID string      `json:"request_id,omitempty"`
	SessionID string      `json:"session_id,omitempty"`
	Data      interface{} `json:"data,omitempty"`
}

type ConnectRequest struct {
	Config ConnectionConfig `json:"config"`
}

type InputData struct {
	Data string `json:"data"`
}

type ResizeData struct {
	Rows int `json:"rows"`
	Cols int `json:"cols"`
}

type BulkDownloadRequest struct {
	RemotePaths  []string `json:"remote_paths"`
	LocalBaseDir string   `json:"local_base_dir"`
}

type BulkUploadRequest struct {
	LocalPaths    []string `json:"local_paths"`
	RemoteBaseDir string   `json:"remote_base_dir"`
}

type BulkDeleteRequest struct {
	RemotePaths []string `json:"remote_paths"`
}

type BulkResult struct {
	Path    string `json:"path"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

type BulkProgress struct {
	TotalItems     int    `json:"total_items"`
	CompletedItems int    `json:"completed_items"`
	FailedItems    int    `json:"failed_items"`
	CurrentItem    string `json:"current_item"`
}
