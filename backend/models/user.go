package models

import "time"

type User struct {
	ID         string    `bson:"_id,omitempty"`
	Provider   string    `bson:"provider"`
	ProviderID string    `bson:"provider_id"`
	Name       string    `bson:"name"`
	Email      string    `bson:"email"`
	AvatarURL  string    `bson:"avatar_url"`
	CreatedAt  time.Time `bson:"created_at"`
}
