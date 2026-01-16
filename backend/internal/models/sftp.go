package models

type FileInfo struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	Mode    uint32 `json:"mode"`
	ModTime int64  `json:"mod_time"`
	IsDir   bool   `json:"is_dir"`
}

type TransferProgress struct {
	TransferID string  `json:"transfer_id"`
	Filename   string  `json:"filename"`
	Total      int64   `json:"total"`
	Transferred int64  `json:"transferred"`
	Percentage float64 `json:"percentage"`
	Status     string  `json:"status"` // uploading, downloading, completed, failed
}

type ListRequest struct {
	Path string `json:"path"`
}

type UploadRequest struct {
	LocalPath  string `json:"local_path"`
	RemotePath string `json:"remote_path"`
}

type DownloadRequest struct {
	RemotePath string `json:"remote_path"`
	LocalPath  string `json:"local_path"`
}

type DeleteRequest struct {
	Path string `json:"path"`
}

type MkdirRequest struct {
	Path string `json:"path"`
}

type RenameRequest struct {
	OldPath string `json:"old_path"`
	NewPath string `json:"new_path"`
}

type CancelRequest struct {
	TransferID string `json:"transfer_id"`
}

type ReadFileRequest struct {
	Path string `json:"path"`
}

type ReadFileResponse struct {
	Content string `json:"content"`
	Path    string `json:"path"`
}

type WriteFileRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}
