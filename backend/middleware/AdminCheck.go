package middleware

import (
	"context"
	"linkshortener/db"

	// "linkshortener/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RoleRequired(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims := c.Locals("user").(jwt.MapClaims)
		userID, err := primitive.ObjectIDFromHex(claims["user_id"].(string))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user id"})
		}

		workspaceID, err := primitive.ObjectIDFromHex(c.Params("id"))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid workspace"})
		}

		coll := db.GetCollection("workspace_members")
		var member struct {
			Role string `bson:"role"`
		}

		err = coll.FindOne(context.TODO(), bson.M{
			"user_id":      userID,
			"workspace_id": workspaceID,
		}).Decode(&member)

		if err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not a member"})
		}

		for _, role := range roles {
			if member.Role == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "insufficient permission"})
	}
}
