package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WorkspaceMember struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id" json:"workspaceId"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	Name        string             `bson:"name,omitempty" json:"name"`
	Email       string             `bson:"email,omitempty" json:"email"`
	Role        string             `bson:"role" json:"role"`
	JoinedAt    time.Time          `bson:"joined_at" json:"joinedAt"`
}
