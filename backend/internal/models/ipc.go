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
	MsgSFTPList     MessageType = "sftp:list"
	MsgSFTPUpload   MessageType = "sftp:upload"
	MsgSFTPDownload MessageType = "sftp:download"
	MsgSFTPDelete   MessageType = "sftp:delete"
	MsgSFTPMkdir    MessageType = "sftp:mkdir"
	MsgSFTPRename   MessageType = "sftp:rename"
	MsgSFTPProgress MessageType = "sftp:progress"
	MsgSFTPCancel   MessageType = "sftp:cancel"
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
