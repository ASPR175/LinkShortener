package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func ClickEventRoutes(app *fiber.App) {
	r := app.Group("/links", middleware.AuthRequired)

	r.Get("/:id/clickevents", handlers.GetClickEvents)
}
