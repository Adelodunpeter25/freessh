package remote

type RemoteTransferRequest struct {
	SourceSessionID string `json:"source_session_id"`
	DestSessionID   string `json:"dest_session_id"`
	SourcePath      string `json:"source_path"`
	DestPath        string `json:"dest_path"`
}

type BulkRemoteTransferRequest struct {
	SourceSessionID string   `json:"source_session_id"`
	DestSessionID   string   `json:"dest_session_id"`
	SourcePaths     []string `json:"source_paths"`
	DestDir         string   `json:"dest_dir"`
}

type RemoteTransferResult struct {
	SourcePath string `json:"source_path"`
	DestPath   string `json:"dest_path"`
	Success    bool   `json:"success"`
	Error      string `json:"error,omitempty"`
}

type RemoteTransferProgress struct {
	TotalItems        int    `json:"total_items"`
	CompletedItems    int    `json:"completed_items"`
	FailedItems       int    `json:"failed_items"`
	CurrentItem       string `json:"current_item"`
	BytesTransferred  int64  `json:"bytes_transferred"`
	TotalBytes        int64  `json:"total_bytes"`
}

type ProgressCallback func(progress RemoteTransferProgress)
