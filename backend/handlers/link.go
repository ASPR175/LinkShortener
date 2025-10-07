package handlers

import (
	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateLink(c *fiber.Ctx) error {
	type Req struct {
		Original    string  `json:"original"`
		WorkspaceID *string `json:"workspace_id,omitempty"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Original) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "original URL required"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userIDStr := claims["user_id"].(string)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	var workspaceObjID *primitive.ObjectID
	if body.WorkspaceID != nil {
		id, err := primitive.ObjectIDFromHex(*body.WorkspaceID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid workspace ID"})
		}

		isMember, _ := utils.IsWorkspaceMember(c.Context(), id, userID)
		if !isMember {
			return c.Status(403).JSON(fiber.Map{"error": "not a workspace member"})
		}
		workspaceObjID = &id
	}

	shortID, _ := utils.GenerateShortID(8)
	link := models.Link{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		WorkspaceID: workspaceObjID,
		Original:    body.Original,
		ShortID:     shortID,
		Clicks:      0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	coll := db.GetCollection("links")
	if _, err := coll.InsertOne(c.Context(), link); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save link"})
	}

	return c.JSON(fiber.Map{
		"_id":        link.ID.Hex(),
		"short_id":   link.ShortID,
		"original":   link.Original,
		"clicks":     link.Clicks,
		"created_at": link.CreatedAt,
		"updated_at": link.UpdatedAt,
	})
}

func GetLinks(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userIDStr := claims["user_id"].(string)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	filter := bson.M{"user_id": userID}
	if wsIDStr := c.Query("workspace_id"); wsIDStr != "" {
		wsID, err := primitive.ObjectIDFromHex(wsIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid workspace ID"})
		}
		isMember, _ := utils.IsWorkspaceMember(c.Context(), wsID, userID)
		if !isMember {
			return c.Status(403).JSON(fiber.Map{"error": "not a workspace member"})
		}
		filter["workspace_id"] = wsID
	} else {
		filter["workspace_id"] = nil
	}

	coll := db.GetCollection("links")
	cursor, _ := coll.Find(c.Context(), filter)
	defer cursor.Close(c.Context())

	var links []models.Link
	_ = cursor.All(c.Context(), &links)
	return c.JSON(links)
}

func FetchData(c *fiber.Ctx) error {
	claims, ok := c.Locals("user").(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "invalid auth context"})
	}

	userIDStr := claims["user_id"].(string)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	linkID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid link id"})
	}

	collection := db.GetCollection("links")
	var link models.Link
	err = collection.FindOne(c.Context(), bson.M{"_id": linkID}).Decode(&link)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found"})
	}

	if link.WorkspaceID == nil {
		if link.UserID != userID {
			return c.Status(403).JSON(fiber.Map{"error": "not your link"})
		}
	} else {

		ok, _ := utils.IsWorkspaceMember(c.Context(), *link.WorkspaceID, userID)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "not a workspace member"})
		}
	}

	return c.JSON(link)
}

func UpdateLink(c *fiber.Ctx) error {
	linkID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid link ID"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID, _ := primitive.ObjectIDFromHex(claims["user_id"].(string))

	coll := db.GetCollection("links")
	var link models.Link
	if err := coll.FindOne(c.Context(), bson.M{"_id": linkID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found"})
	}

	if link.WorkspaceID != nil {
		ok, _ := utils.IsWorkspaceAdmin(c.Context(), *link.WorkspaceID, userID)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "only admin can update workspace links"})
		}
	} else if link.UserID != userID {
		return c.Status(403).JSON(fiber.Map{"error": "not your link"})
	}

	type Req struct {
		Original string `json:"original"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Original) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	_, err = coll.UpdateOne(c.Context(), bson.M{"_id": linkID}, bson.M{
		"$set": bson.M{
			"original":   body.Original,
			"updated_at": time.Now(),
		},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "update failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func DeleteLink(c *fiber.Ctx) error {
	linkID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid link ID"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID, _ := primitive.ObjectIDFromHex(claims["user_id"].(string))

	coll := db.GetCollection("links")
	var link models.Link
	if err := coll.FindOne(c.Context(), bson.M{"_id": linkID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found"})
	}

	if link.WorkspaceID != nil {
		ok, _ := utils.IsWorkspaceAdmin(c.Context(), *link.WorkspaceID, userID)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "only admin can delete workspace links"})
		}
	} else if link.UserID != userID {
		return c.Status(403).JSON(fiber.Map{"error": "not your link"})
	}

	if _, err := coll.DeleteOne(c.Context(), bson.M{"_id": linkID}); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "delete failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func CreateWorkspaceLink(c *fiber.Ctx) error {
	workspaceID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid workspace ID"})
	}

	type Req struct {
		Original string `json:"original"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Original) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "original URL required"})
	}

	claims := c.Locals("user").(jwt.MapClaims)
	userID, _ := primitive.ObjectIDFromHex(claims["user_id"].(string))

	isMember, _ := utils.IsWorkspaceMember(c.Context(), workspaceID, userID)
	if !isMember {
		return c.Status(403).JSON(fiber.Map{"error": "not a workspace member"})
	}

	shortID, _ := utils.GenerateShortID(8)
	link := models.Link{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		WorkspaceID: &workspaceID,
		Original:    body.Original,
		ShortID:     shortID,
		Clicks:      0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	coll := db.GetCollection("links")
	if _, err := coll.InsertOne(c.Context(), link); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save link"})
	}

	return c.JSON(fiber.Map{
		"_id": link.ID.Hex(),
		// "short_id":   os.Getenv("APP_BASE_URL") + "/" + shortID,
		"short_id":   shortID,
		"original":   link.Original,
		"clicks":     link.Clicks,
		"created_at": link.CreatedAt,
		"updated_at": link.UpdatedAt,
	})
}

func UpdateWorkspaceLink(c *fiber.Ctx) error {
	workspaceID, _ := primitive.ObjectIDFromHex(c.Params("id"))
	linkID, _ := primitive.ObjectIDFromHex(c.Params("linkId"))
	claims := c.Locals("user").(jwt.MapClaims)
	userID, _ := primitive.ObjectIDFromHex(claims["user_id"].(string))

	coll := db.GetCollection("links")
	var link models.Link
	if err := coll.FindOne(c.Context(), bson.M{"_id": linkID, "workspace_id": workspaceID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found in workspace"})
	}

	ok, _ := utils.IsWorkspaceAdmin(c.Context(), workspaceID, userID)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"error": "only admin can update workspace links"})
	}

	type Req struct {
		Original string `json:"original"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Original) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	_, err := coll.UpdateOne(c.Context(), bson.M{"_id": linkID}, bson.M{
		"$set": bson.M{"original": body.Original, "updated_at": time.Now()},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "update failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func DeleteWorkspaceLink(c *fiber.Ctx) error {
	workspaceID, _ := primitive.ObjectIDFromHex(c.Params("id"))
	linkID, _ := primitive.ObjectIDFromHex(c.Params("linkId"))
	claims := c.Locals("user").(jwt.MapClaims)
	userID, _ := primitive.ObjectIDFromHex(claims["user_id"].(string))

	coll := db.GetCollection("links")
	var link models.Link
	if err := coll.FindOne(c.Context(), bson.M{"_id": linkID, "workspace_id": workspaceID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found in workspace"})
	}

	ok, _ := utils.IsWorkspaceAdmin(c.Context(), workspaceID, userID)
	if !ok {
		return c.Status(403).JSON(fiber.Map{"error": "only admin can delete workspace links"})
	}

	if _, err := coll.DeleteOne(c.Context(), bson.M{"_id": linkID}); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "delete failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}
