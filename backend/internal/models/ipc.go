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

	// Export messages
	MsgExportFreeSSH MessageType = "export:freessh"

	// Import messages
	MsgImportFreeSSH MessageType = "import:freessh"

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
	MsgKnownHostList   MessageType = "known_host:list"
	MsgKnownHostRemove MessageType = "known_host:remove"
	MsgKnownHostTrust  MessageType = "known_host:trust"
	MsgKnownHostImport MessageType = "known_host:import"
	MsgHostKeyVerify   MessageType = "host_key:verify"
	MsgHostKeyVerifyResponse MessageType = "host_key:verify_response"

	// Group messages
	MsgGroupList   MessageType = "group:list"
	MsgGroupCreate MessageType = "group:create"
	MsgGroupRename MessageType = "group:rename"
	MsgGroupDelete MessageType = "group:delete"
)

type IPCMessage struct {
	Type      MessageType `json:"type"`
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
