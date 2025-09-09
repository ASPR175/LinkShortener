package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func ClickEventRoutes(app *fiber.App) {
	a := app.Group("/clickevent", middleware.AuthRequired)
	a.Get("/links/:id/events", handlers.GetClickEvents)
	a.Get("/links/:id/summary", handlers.GetAnalytics)
}
