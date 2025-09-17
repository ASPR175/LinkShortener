package handlers

import (
	"context"
	"time"

	"linkshortener/db"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func GetAnalytics(c *fiber.Ctx) error {

	linkIDStr := c.Params("id")
	linkID, err := primitive.ObjectIDFromHex(linkIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid link id"})
	}

	coll := db.GetCollection("click_events")

	ctx, cancel := context.WithTimeout(c.Context(), 10*time.Second)
	defer cancel()

	total, err := coll.CountDocuments(ctx, bson.M{"link_id": linkID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to count documents"})
	}

	var uniqueIPsArr []string
	err = coll.Distinct(ctx, "ip", bson.M{"link_id": linkID}).Decode(&uniqueIPsArr)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to distinct ips"})
	}
	uniqueIPs := int64(len(uniqueIPsArr))

	aggregateField := func(field string) ([]bson.M, error) {
		pipeline := []bson.M{
			{"$match": bson.M{"link_id": linkID}},
			{"$group": bson.M{"_id": "$" + field, "count": bson.M{"$sum": 1}}},
			{"$sort": bson.M{"count": -1}},
		}

		cur, err := coll.Aggregate(ctx, pipeline)
		if err != nil {
			return nil, err
		}
		defer cur.Close(ctx)

		var out []bson.M
		if err := cur.All(ctx, &out); err != nil {
			return nil, err
		}
		return out, nil
	}

	byCountry, err := aggregateField("country")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to aggregate country"})
	}
	byBrowser, err := aggregateField("browser")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to aggregate browser"})
	}
	byDevice, err := aggregateField("device")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to aggregate device"})
	}
	byReferrer, err := aggregateField("referrer")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to aggregate referrer"})
	}
	return c.JSON(fiber.Map{
		"total_clicks": total,
		"unique_ips":   uniqueIPs,
		"by_country":   byCountry,
		"by_referrer":  byReferrer,
		"by_browser":   byBrowser,
		"by_device":    byDevice,
	})
}
