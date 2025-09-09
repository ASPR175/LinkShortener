package handlers

import (
	"context"

	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"

	"encoding/json"

	"linkshortener/db"
	"linkshortener/models"
	"linkshortener/utils"

	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func OAuthStart(c *fiber.Ctx) error {
	provider := c.Params("provider")
	var redirectURL string

	switch provider {
	case "google":
		redirectURL = "https://accounts.google.com/o/oauth2/v2/auth?" +
			"client_id=" + os.Getenv("OAUTH_GOOGLE_CLIENT_ID") +
			"&redirect_uri=" + os.Getenv("OAUTH_CALLBACK_URL") + "/auth/google/callback" +
			"&response_type=code&scope=openid%20email%20profile"
	case "github":
		redirectURL = "https://github.com/login/oauth/authorize?" +
			"client_id=" + os.Getenv("OAUTH_GITHUB_CLIENT_ID") +
			"&redirect_uri=" + os.Getenv("OAUTH_CALLBACK_URL") + "/auth/github/callback" +
			"&scope=user:email"
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "unsupported provider"})
	}

	return c.Redirect(redirectURL)
}

func OAuthCallback(c *fiber.Ctx) error {
	provider := c.Params("provider")
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing code"})
	}

	var userEmail, userName, avatarURL, userID string

	switch provider {
	case "google":
		data := url.Values{
			"code":          {code},
			"client_id":     {os.Getenv("OAUTH_GOOGLE_CLIENT_ID")},
			"client_secret": {os.Getenv("OAUTH_GOOGLE_CLIENT_SECRET")},
			"redirect_uri":  {os.Getenv("OAUTH_CALLBACK_URL") + "/auth/google/callback"},
			"grant_type":    {"authorization_code"},
		}
		req, _ := http.NewRequest("POST", "https://oauth2.googleapis.com/token", strings.NewReader(data.Encode()))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Accept", "application/json")

		tokenResp, err := http.DefaultClient.Do(req)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer tokenResp.Body.Close()

		var t struct {
			AccessToken string `json:"access_token"`
		}
		if err := json.NewDecoder(tokenResp.Body).Decode(&t); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "decode token failed"})
		}

		userResp, _ := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + t.AccessToken)
		defer userResp.Body.Close()
		var u struct {
			ID      string `json:"id"`
			Email   string `json:"email"`
			Name    string `json:"name"`
			Picture string `json:"picture"`
		}
		_ = json.NewDecoder(userResp.Body).Decode(&u)

		userEmail, userName, avatarURL, userID = u.Email, u.Name, u.Picture, u.ID

	case "github":
		data := url.Values{
			"code":          {code},
			"client_id":     {os.Getenv("OAUTH_GITHUB_CLIENT_ID")},
			"client_secret": {os.Getenv("OAUTH_GITHUB_CLIENT_SECRET")},
			"redirect_uri":  {os.Getenv("OAUTH_CALLBACK_URL") + "/auth/github/callback"},
		}
		req, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", strings.NewReader(data.Encode()))
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		tokenResp, err := http.DefaultClient.Do(req)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer tokenResp.Body.Close()

		var t struct {
			AccessToken string `json:"access_token"`
		}
		if err := json.NewDecoder(tokenResp.Body).Decode(&t); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "decode token failed"})
		}

		reqUser, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
		reqUser.Header.Set("Authorization", "Bearer "+t.AccessToken)
		userResp, _ := http.DefaultClient.Do(reqUser)
		defer userResp.Body.Close()

		var u struct {
			ID        int    `json:"id"`
			Login     string `json:"login"`
			Name      string `json:"name"`
			Email     string `json:"email"`
			AvatarURL string `json:"avatar_url"`
		}
		_ = json.NewDecoder(userResp.Body).Decode(&u)

		if u.Email == "" {
			reqEmail, _ := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
			reqEmail.Header.Set("Authorization", "Bearer "+t.AccessToken)
			emailResp, err := http.DefaultClient.Do(reqEmail)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Email needed"})
			}
			defer emailResp.Body.Close()
			var emails []struct {
				Email   string `json:"email"`
				Primary bool   `json:"primary"`
			}
			_ = json.NewDecoder(emailResp.Body).Decode(&emails)
			for _, e := range emails {
				if e.Primary {
					u.Email = e.Email
					break
				}
			}
		}

		userEmail, userName, avatarURL, userID = u.Email, u.Name, u.AvatarURL, fmt.Sprint(u.ID)

	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "unsupported provider"})
	}

	usersColl := db.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing models.User
	err := usersColl.FindOne(ctx, bson.M{"email": userEmail}).Decode(&existing)
	if err == mongo.ErrNoDocuments {
		newUser := models.User{
			ID:         primitive.NewObjectID(),
			Provider:   provider,
			ProviderID: userID,
			Name:       userName,
			Email:      userEmail,
			AvatarURL:  avatarURL,
			CreatedAt:  time.Now(),
		}
		_, err := usersColl.InsertOne(ctx, newUser)
		if err != nil {
			log.Println("Insert error:", err)
			return c.Status(500).JSON(fiber.Map{"error": "db insert failed"})
		}
		existing = newUser
	} else if err != nil {
		log.Println("FindOne error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "db find failed"})
	}

	token, _ := utils.GenerateJWT(existing.ID, existing.Email, existing.Name)
	userJSON, _ := json.Marshal(existing)
	return c.Redirect(fmt.Sprintf(
		"http://localhost:3000/auth/callback?token=%s&user=%s",
		token,
		url.QueryEscape(string(userJSON)),
	))

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
