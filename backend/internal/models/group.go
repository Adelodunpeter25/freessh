package models

import "time"

type Group struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	ConnectionCount int       `json:"connection_count"`
	CreatedAt       time.Time `json:"created_at"`
}
