package models

import "time"

type ClickEvent struct {
	ID        string    `bson:"_id,omitempty"`
	LinkID    string    `bson:"link_id"`
	Timestamp time.Time `bson:"timestamp"`
	Referrer  string    `bson:"referrer"`
	IP        string    `bson:"ip"`
	Device    string    `bson:"device"`
}
