package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GenerateJWT(userID primitive.ObjectID, email, name string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.Hex(),
		"email":   email,
		"name":    name,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	return token.SignedString([]byte(secret))
}
