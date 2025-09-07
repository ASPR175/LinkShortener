package routes

import (
	"linkshortener/handlers"

	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func ApikeyRoutes(app *fiber.App) {
	r := app.Group("/workspace", middleware.AuthRequired)
	a := app.Group("/apikeys", middleware.AuthRequired)
	r.Post("/:id/apikeys", handlers.CreateKeys)
	r.Get("/:id/apikeys", handlers.GetKeys)
	a.Delete("/:id", handlers.DeleteKeys)
}
