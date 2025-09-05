package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func LinkRoutes(app *fiber.App) {
	r := app.Group("/urls", middleware.AuthRequired)

	r.Post("/", handlers.ShortenLink)
	r.Get("/:id", handlers.GetLink)
	r.Delete("/:id", handlers.DeleteLink)
}
