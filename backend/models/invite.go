package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WorkspaceInvite struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id"`
	Email       string             `bson:"email"`
	Role        string             `bson:"role"`
	Token       string             `bson:"token"`
	Status      string             `bson:"status"`
	InvitedBy   primitive.ObjectID `bson:"invited_by"`
	CreatedAt   time.Time          `bson:"created_at"`
	ExpiresAt   time.Time          `bson:"expires_at"`
}
