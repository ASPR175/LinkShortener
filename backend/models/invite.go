package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WorkspaceInvite struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id" json:"workspaceId"`
	Email       string             `bson:"email" json:"email"`
	Role        string             `bson:"role" json:"role"`
	Token       string             `bson:"token" json:"token"`
	Status      string             `bson:"status" json:"status"`
	InvitedBy   primitive.ObjectID `bson:"invited_by" json:"invitedBy"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	ExpiresAt   time.Time          `bson:"expires_at" json:"expiresAt"`
}
