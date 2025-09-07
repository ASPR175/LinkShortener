package routes

import (
	"linkshortener/handlers"

	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func CustomdomainRoutes(app *fiber.App) {
	r := app.Group("/workspace", middleware.AuthRequired)
	s := app.Group("/domain", middleware.AuthRequired)
	r.Post("/:id/domains", handlers.AddDomain)
	s.Patch("/:id/verify", handlers.VerifyDomain)
	s.Delete("/:id", handlers.DeleteDomain)
}
