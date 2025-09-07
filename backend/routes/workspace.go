package routes

import (
	"linkshortener/handlers"

	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func WorkspaceRoutes(app *fiber.App) {
	r := app.Group("/workspace", middleware.AuthRequired)
	r.Post("/", handlers.CreateSpace)
	r.Get("/", handlers.GetSpaces)
	r.Get("/:id", handlers.SpaceDetail)
	r.Post("/:id/members", handlers.InviteMember)
	r.Patch("/:id/members/:userId", handlers.UpdateRole)
	r.Delete("/:id/members/:userId", handlers.RemoveMember)

}
