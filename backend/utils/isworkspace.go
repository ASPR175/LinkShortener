package utils

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"linkshortener/db"
	"linkshortener/models"
)

func IsWorkspaceAdmin(ctx context.Context, workspaceID, userID primitive.ObjectID) (bool, error) {
	coll := db.GetCollection("workspace_members")

	var member models.WorkspaceMember
	err := coll.FindOne(ctx, bson.M{
		"workspace_id": workspaceID,
		"user_id":      userID,
	}).Decode(&member)

	if err != nil {
		return false, errors.New("not a member of workspace")
	}

	if member.Role == "admin" {
		return true, nil
	}

	return false, nil
}
func IsWorkspaceMember(ctx context.Context, workspaceID, userID primitive.ObjectID) (bool, error) {
	coll := db.GetCollection("workspace_members")

	err := coll.FindOne(ctx, bson.M{
		"workspace_id": workspaceID,
		"user_id":      userID,
	}).Err()

	if err != nil {
		return false, err
	}
	return true, nil
}
