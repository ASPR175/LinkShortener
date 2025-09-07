package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ClickEvent struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	LinkID    primitive.ObjectID `bson:"link_id"`
	Timestamp time.Time          `bson:"timestamp"`
	Referrer  string             `bson:"referrer"`
	IP        string             `bson:"ip"`
	Country   string             `bson:"country"`
	Browser   string             `bson:"browser"`
	Device    string             `bson:"device"`
}
