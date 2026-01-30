package models

import "time"

type HistoryEntry struct {
	ID        string    `json:"id"`
	Command   string    `json:"command"`
	Timestamp time.Time `json:"timestamp"`
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
