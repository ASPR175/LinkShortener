package handlers

import (
	"context"

	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func Redirect(c *fiber.Ctx) error {
	shortID := c.Params("short_id")
	if shortID == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid short link.")
	}

	collection := db.GetCollection("links")

	var link models.Link
	err := collection.FindOne(c.Context(), bson.M{"short_id": shortID}).Decode(&link)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("This short link does not exist.")
	}

	go func() {
		_, _ = collection.UpdateOne(context.Background(),
			bson.M{"_id": link.ID},
			bson.M{"$inc": bson.M{"clicks": 1}},
		)
	}()

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

	go func() {
		clickColl := db.GetCollection("click_events")
		_, _ = clickColl.InsertOne(context.Background(), click)
	}()

	original := link.Original
	if !strings.HasPrefix(original, "http://") && !strings.HasPrefix(original, "https://") {
		original = "http://" + original
	}

	parsedURL, err := url.Parse(original)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return c.Status(fiber.StatusBadRequest).SendString("Invalid redirect target.")
	}

	return c.Redirect(original, fiber.StatusFound)
}
