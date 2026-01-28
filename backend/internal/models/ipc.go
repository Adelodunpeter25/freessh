package models

type MessageType string

const (
	MsgConnect       MessageType = "connect"
	MsgDisconnect    MessageType = "disconnect"
	MsgInput         MessageType = "input"
	MsgOutput        MessageType = "output"
	MsgResize        MessageType = "resize"
	MsgError         MessageType = "error"
	MsgSessionStatus MessageType = "session_status"
	MsgSessionList   MessageType = "session_list"
	
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

	// Keychain messages
	MsgKeychainSet    MessageType = "keychain:set"
	MsgKeychainGet    MessageType = "keychain:get"
	MsgKeychainDelete MessageType = "keychain:delete"

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
	MsgHostKeyVerify   MessageType = "host_key:verify"
	MsgHostKeyVerifyResponse MessageType = "host_key:verify_response"
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
