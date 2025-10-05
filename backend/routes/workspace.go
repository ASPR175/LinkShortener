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
	r.Get("/join/:token", handlers.AcceptInvite)
	r.Post("/:id/members", middleware.RoleRequired("owner", "admin"), handlers.InviteMember)
	r.Post("/invite/:inviteId/resend", middleware.RoleRequired("owner", "admin"), handlers.ResendInvite)
	r.Patch("/:id/members/:userId", middleware.RoleRequired("owner", "admin"), handlers.UpdateRole)
	r.Delete("/:id/members/:userId", middleware.RoleRequired("owner", "admin"), handlers.RemoveMember)
	r.Post("/:id/links", middleware.RoleRequired("member", "admin", "owner"), handlers.CreateWorkspaceLink)
	r.Get("/:id/links", middleware.RoleRequired("member", "admin", "owner"), handlers.GetLinks)
	r.Patch("/:id/links/:linkId", middleware.RoleRequired("admin", "owner"), handlers.UpdateWorkspaceLink)
	r.Delete("/:id/links/:linkId", middleware.RoleRequired("admin", "owner"), handlers.DeleteWorkspaceLink)
}
