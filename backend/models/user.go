package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Provider   string             `bson:"provider"`
	ProviderID string             `bson:"provider_id"`
	Name       string             `bson:"name"`
	Email      string             `bson:"email"`
	AvatarURL  string             `bson:"avatar_url"`
	CreatedAt  time.Time          `bson:"created_at"`
}
