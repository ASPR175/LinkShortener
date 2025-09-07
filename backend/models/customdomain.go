package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CustomDomain struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	WorkspaceID primitive.ObjectID `bson:"workspace_id"`
	Domain      string             `bson:"domain"`
	Verified    bool               `bson:"verified"`
	AddedAt     time.Time          `bson:"added_at"`
}
