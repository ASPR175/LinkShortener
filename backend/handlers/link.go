package handlers

import (
	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"
	"os"
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
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	if body.Original == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "original URL required"})
	}

	shortID, err := utils.GenerateShortID(8)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate id"})
	}

	claimsInterface := c.Locals("user")
	if claimsInterface == nil {
		return c.Status(401).JSON(fiber.Map{"error": "missing JWT claims"})
	}
	claims, ok := claimsInterface.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "invalid JWT claims type"})
	}
	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "user_id not found in JWT"})
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "user_id invalid format"})
	}

	var workspaceObjID *primitive.ObjectID
	if body.WorkspaceID != nil {
		id, err := primitive.ObjectIDFromHex(*body.WorkspaceID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid workspace_id"})
		}

		isMember, _ := utils.IsWorkspaceMember(c.Context(), id, userID)
		if !isMember {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not a workspace member"})
		}
		workspaceObjID = &id
	}

	link := models.Link{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		WorkspaceID: workspaceObjID,
		Original:    body.Original,
		ShortID:     shortID,
		Clicks:      0,
		CreatedAt:   time.Now(),
	}

	collection := db.GetCollection("links")
	_, err = collection.InsertOne(c.Context(), link)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save link"})
	}

	return c.JSON(fiber.Map{
		"_id":        link.ID.Hex(),
		"short_id":   os.Getenv("APP_BASE_URL") + "/" + shortID,
		"original":   link.Original,
		"created_at": link.CreatedAt,
	})
}

func GetLinks(c *fiber.Ctx) error {
	claims, ok := c.Locals("user").(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "invalid auth context"})
	}

	userIDStr := claims["user_id"].(string)
	userID, _ := primitive.ObjectIDFromHex(userIDStr)

	workspaceIDStr := c.Query("workspace_id")
	collection := db.GetCollection("links")

	var filter bson.M
	if workspaceIDStr == "" {

		filter = bson.M{"user_id": userID, "workspace_id": nil}
	} else {
		workspaceID, err := primitive.ObjectIDFromHex(workspaceIDStr)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid workspace_id"})
		}

		isMember, _ := utils.IsWorkspaceMember(c.Context(), workspaceID, userID)
		if !isMember {
			return c.Status(403).JSON(fiber.Map{"error": "not a workspace member"})
		}
		filter = bson.M{"workspace_id": workspaceID}
	}

	cursor, err := collection.Find(c.Context(), filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch links"})
	}
	defer cursor.Close(c.Context())

	var links []models.Link
	if err := cursor.All(c.Context(), &links); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "decode error"})
	}

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
	if err := collection.FindOne(c.Context(), bson.M{"_id": linkID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found"})
	}

	if link.WorkspaceID == nil {
		if link.UserID != userID {
			return c.Status(403).JSON(fiber.Map{"error": "not your link"})
		}
	} else {
		ok, _ := utils.IsWorkspaceAdmin(c.Context(), *link.WorkspaceID, userID)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "only admin can update workspace links"})
		}
	}

	type Req struct {
		Original string `json:"original"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	update := bson.M{"$set": bson.M{
		"original":  body.Original,
		"updatedAt": time.Now(),
	}}
	_, err = collection.UpdateOne(c.Context(), bson.M{"_id": linkID}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "update failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}

func DeleteLink(c *fiber.Ctx) error {
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
	if err := collection.FindOne(c.Context(), bson.M{"_id": linkID}).Decode(&link); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "link not found"})
	}

	if link.WorkspaceID == nil {
		if link.UserID != userID {
			return c.Status(403).JSON(fiber.Map{"error": "not your link"})
		}
	} else {
		ok, _ := utils.IsWorkspaceAdmin(c.Context(), *link.WorkspaceID, userID)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "only admin can delete workspace links"})
		}
	}

	_, err = collection.DeleteOne(c.Context(), bson.M{"_id": linkID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "delete failed"})
	}

	return c.JSON(fiber.Map{"success": true})
}

// /////////////////////////

func CreateWorkspaceLink(c *fiber.Ctx) error {
	// 1️⃣ Parse workspace ID from URL
	workspaceIDHex := c.Params("id")
	workspaceID, err := primitive.ObjectIDFromHex(workspaceIDHex)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid workspace ID"})
	}

	// 2️⃣ Parse request body
	type Req struct {
		Original string `json:"original"`
	}
	var body Req
	if err := c.BodyParser(&body); err != nil || strings.TrimSpace(body.Original) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "original URL required"})
	}

	// 3️⃣ Get JWT claims safely
	claimsInterface := c.Locals("user")
	if claimsInterface == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing JWT claims"})
	}
	claims, ok := claimsInterface.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid JWT claims type"})
	}

	// 4️⃣ Extract user ID safely
	var userIDStr string
	if val, exists := claims["user_id"].(string); exists && val != "" {
		userIDStr = val
	} else if val, exists := claims["id"].(string); exists && val != "" {
		userIDStr = val
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user ID not found in JWT"})
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid user ID format"})
	}

	// 5️⃣ Check workspace membership
	isMember, err := utils.IsWorkspaceMember(c.Context(), workspaceID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to verify workspace membership"})
	}
	if !isMember {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not a workspace member"})
	}

	// 6️⃣ Create link safely
	shortID, err := utils.GenerateShortID(8)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate short ID"})
	}

	link := models.Link{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		WorkspaceID: &workspaceID,
		Original:    body.Original,
		ShortID:     shortID,
		Clicks:      0,
		CreatedAt:   time.Now(),
	}

	coll := db.GetCollection("links")
	_, err = coll.InsertOne(c.Context(), link)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save link"})
	}

	// 7️⃣ Return clean JSON response
	return c.JSON(fiber.Map{
		"_id":        link.ID.Hex(),
		"short_id":   os.Getenv("APP_BASE_URL") + "/" + shortID,
		"original":   link.Original,
		"clicks":     link.Clicks,
		"created_at": link.CreatedAt,
	})
}

////////////////////////////////////////////////////
