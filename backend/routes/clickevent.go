package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func ClickEventRoutes(app *fiber.App) {
	a := app.Group("/links", middleware.AuthRequired)
	a.Get("/:id/summary", handlers.GetAnalytics)
}
