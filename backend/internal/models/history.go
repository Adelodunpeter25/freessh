package models

type HistoryEntry struct {
	ID      string `json:"id"`
	Command string `json:"command"`
}

type HistoryListRequest struct{}

type HistoryListResponse struct {
	Entries []HistoryEntry `json:"entries"`
}

type HistoryAddRequest struct {
	Command string `json:"command"`
}

type HistoryAddResponse struct {
	Entry HistoryEntry `json:"entry"`
}

type HistoryClearRequest struct{}

type HistoryClearResponse struct {
	Status string `json:"status"`
}
