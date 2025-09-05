package routes

import (
	"linkshortener/handlers"

	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(app *fiber.App) {
	app.Get("/auth/:provider", handlers.OAuthStart)
	app.Get("/auth/:provider/callback", handlers.OAuthCallback)
	app.Post("/auth/logout", handlers.Logout)
}
