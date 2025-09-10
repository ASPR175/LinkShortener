package handlers

import (
	"linkshortener/db"
	"linkshortener/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func GetClickEvents(c *fiber.Ctx) error {
	linkID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid link id"})
	}

	coll := db.GetCollection("click_events")
	cursor, err := coll.Find(c.Context(), bson.M{"link_id": linkID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch events"})
	}
	defer cursor.Close(c.Context())

	var events []models.ClickEvent
	if err := cursor.All(c.Context(), &events); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "decode error"})
	}

	return c.JSON(events)
}

func GetAnalytics(c *fiber.Ctx) error {
	linkID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid link id"})
	}

	coll := db.GetCollection("click_events")

	total, err := coll.CountDocuments(c.Context(), bson.M{"link_id": linkID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to count"})
	}

	pipeCountry := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"link_id": linkID}}},
		{{Key: "$group", Value: bson.M{"_id": "$country", "count": bson.M{"$sum": 1}}}},
	}
	cursor, _ := coll.Aggregate(c.Context(), pipeCountry)
	var byCountry []bson.M
	cursor.All(c.Context(), &byCountry)

	pipeBrowser := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"link_id": linkID}}},
		{{Key: "$group", Value: bson.M{"_id": "$browser", "count": bson.M{"$sum": 1}}}},
	}
	cursor, _ = coll.Aggregate(c.Context(), pipeBrowser)
	var byBrowser []bson.M
	cursor.All(c.Context(), &byBrowser)

	pipeDevice := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"link_id": linkID}}},
		{{Key: "$group", Value: bson.M{"_id": "$device", "count": bson.M{"$sum": 1}}}},
	}
	cursor, _ = coll.Aggregate(c.Context(), pipeDevice)
	var byDevice []bson.M
	cursor.All(c.Context(), &byDevice)

	return c.JSON(fiber.Map{
		"total_clicks": total,
		"by_country":   byCountry,
		"by_browser":   byBrowser,
		"by_device":    byDevice,
	})
}
