package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Link struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty"`
	UserID      primitive.ObjectID  `bson:"user_id"`
	WorkspaceID *primitive.ObjectID `bson:"workspace_id,omitempty"`
	Original    string              `bson:"original"`
	ShortID     string              `bson:"short_id"`
	Clicks      int                 `bson:"clicks"`
	CreatedAt   time.Time           `bson:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at"`
}
