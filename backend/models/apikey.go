package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type APIKey struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id"`
	Key         string             `bson:"key"`
	CreatedAt   time.Time          `bson:"created_at"`
	ExpiresAt   *time.Time         `bson:"expires_at,omitempty"`
	DailyLimit  int                `bson:"daily_limit"`
	UsedToday   int                `bson:"used_today"`
}
