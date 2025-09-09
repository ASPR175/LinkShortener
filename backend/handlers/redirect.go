package handlers

import (
	"linkshortener/db"
	"linkshortener/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func Redirect(c *fiber.Ctx) error {
	shortID := c.Params("short_id")

	collection := db.GetCollection("links")
	var link models.Link
	err := collection.FindOne(c.Context(), bson.M{"short_id": shortID}).Decode(&link)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "link not found"})
	}

	_, _ = collection.UpdateOne(c.Context(),
		bson.M{"_id": link.ID},
		bson.M{"$inc": bson.M{"clicks": 1}},
	)

	return c.Redirect(link.Original, fiber.StatusFound)
}
