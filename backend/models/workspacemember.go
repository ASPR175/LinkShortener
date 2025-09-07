package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WorkspaceMember struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Role        string             `bson:"role"`
	JoinedAt    time.Time          `bson:"joined_at"`
}
