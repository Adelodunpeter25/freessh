package models

import "time"

type Snippet struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Command   string    `json:"command"`
	Tags      []string  `json:"tags,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type SnippetListRequest struct{}

type SnippetListResponse struct {
	Snippets []Snippet `json:"snippets"`
}

type SnippetCreateRequest struct {
	Name    string   `json:"name"`
	Command string   `json:"command"`
	Tags    []string `json:"tags,omitempty"`
}

type SnippetCreateResponse struct {
	Snippet Snippet `json:"snippet"`
}

type SnippetUpdateRequest struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Command string   `json:"command"`
	Tags    []string `json:"tags,omitempty"`
}

type SnippetUpdateResponse struct {
	Snippet Snippet `json:"snippet"`
}

type SnippetDeleteRequest struct {
	ID string `json:"id"`
}

type SnippetDeleteResponse struct {
	Status string `json:"status"`
}
