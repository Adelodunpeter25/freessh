package sftp

const (
	maxConcurrentTransfers = 5
	bufferSize             = 128 * 1024
)

type BulkResult struct {
	Path    string
	Success bool
	Error   string
}

type BulkProgress struct {
	TotalItems     int
	CompletedItems int
	FailedItems    int
	CurrentItem    string
}

type BulkProgressCallback func(progress BulkProgress)
