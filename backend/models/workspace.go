package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Workspace struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Name      string             `bson:"name"`
	CreatedBy primitive.ObjectID `bson:"created_by"`
	CreatedAt time.Time          `bson:"created_at"`
}
