package handlers

import (
	"context"
	// "os"
	"time"
	//    "net/http"
	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/shareed2k/goth_fiber"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func OAuthStart(c *fiber.Ctx) error {
	goth_fiber.BeginAuthHandler(c)
	return nil
}

func OAuthCallback(c *fiber.Ctx) error {
	user, err := goth_fiber.CompleteUserAuth(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	usersColl := db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing models.User
	err = usersColl.FindOne(ctx, map[string]interface{}{"email": user.Email}).Decode(&existing)

	if err == mongo.ErrNoDocuments {
		newUser := models.User{
			Provider:   user.Provider,
			ProviderID: user.UserID,
			Name:       user.Name,
			Email:      user.Email,
			AvatarURL:  user.AvatarURL,
			CreatedAt:  time.Now(),
		}
		_, err := usersColl.InsertOne(ctx, newUser)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save user"})
		}
		existing = newUser
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database error"})
	}

	signed, err := utils.GenerateJWT(existing.Email, existing.Name)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to sign JWT"})
	}

	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"name":       existing.Name,
			"email":      existing.Email,
			"avatar_url": existing.AvatarURL,
		},
		"token": signed,
	})
}

func Logout(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing or invalid token"})
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	token, _, err := new(jwt.Parser).ParseUnverified(tokenStr, jwt.MapClaims{})
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["exp"] == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	expUnix := int64(claims["exp"].(float64))
	exp := time.Until(time.Unix(expUnix, 0))

	if err := utils.BlacklistToken(tokenStr, exp); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not blacklist token"})
	}

	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}
