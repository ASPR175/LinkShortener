package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Link struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"_id"`
	UserID      primitive.ObjectID  `bson:"user_id" json:"user_id"`
	Original    string              `bson:"original" json:"original"`
	ShortID     string              `bson:"short_id" json:"short_id"`
	WorkspaceID *primitive.ObjectID `bson:"workspace_id,omitempty" json:"workspace_id,omitempty"`
	Clicks      int                 `bson:"clicks" json:"clicks"`
	CreatedAt   time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at"`
}
