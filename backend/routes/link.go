package routes

import (
	"linkshortener/handlers"
	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func LinkRoutes(app *fiber.App) {
	r := app.Group("/links", middleware.AuthRequired)

	r.Post("/", handlers.ListLink)
	r.Get("/", handlers.GetLinks)
	r.Get("/:id", handlers.FetchData)
	r.Patch("/:id", handlers.UpdateLink)
	r.Delete("/:id", handlers.DeleteLink)
}
