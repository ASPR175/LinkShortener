package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func AnalyticsRoutes(app *fiber.App) {
	r := app.Group("/analytics", middleware.AuthRequired)

	r.Get("/:id", handlers.GetAnalytics)
}
