package handlers

import (
	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

	ip := c.IP()
	referrer := c.Get("Referer")
	ua := c.Get("User-Agent")

	country := utils.LookupCountry(ip)
	browser, device := utils.ParseUserAgent(ua)

	click := models.ClickEvent{
		ID:        primitive.NewObjectID(),
		LinkID:    link.ID,
		Timestamp: time.Now(),
		Referrer:  referrer,
		IP:        ip,
		Country:   country,
		Browser:   browser,
		Device:    device,
	}

	clickColl := db.GetCollection("click_events")
	_, _ = clickColl.InsertOne(c.Context(), click)

	return c.Redirect(link.Original, fiber.StatusFound)
}
