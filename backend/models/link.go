package models

import "time"

type Link struct {
	ID        string    `bson:"_id,omitempty"`
	UserID    string    `bson:"user_id"`
	Original  string    `bson:"original"`
	ShortID   string    `bson:"short_id"`
	Clicks    string    `bson:"clicks"`
	CreatedAt time.Time `bson:"created_at"`
}
