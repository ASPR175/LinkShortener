package routes

import (
	"linkshortener/handlers"

	"linkshortener/middleware"

	"github.com/gofiber/fiber/v2"
)

func WorkspaceRoutes(app *fiber.App) {

	r := app.Group("/workspace", middleware.AuthRequired)
	r.Post("/", handlers.CreateSpace)
	r.Get("/join/:token", handlers.AcceptInvite)
	r.Get("/", handlers.GetSpaces)
	r.Get("/:id", handlers.SpaceDetail)
	r.Post("/:id/members", middleware.RoleRequired("owner"), handlers.InviteMember)
	r.Get("/:id/members", handlers.GetWorkspaceMembers)
	r.Get("/:id/invites", middleware.RoleRequired("owner", "admin"), handlers.GetWorkspaceInvites)
	r.Post("/invite/:inviteId/resend", middleware.RoleRequired("owner"), handlers.ResendInvite)
	r.Patch("/:id/members/:userId", middleware.RoleRequired("owner", "admin"), handlers.UpdateRole)
	r.Delete("/:id/members/:userId", middleware.RoleRequired("owner"), handlers.RemoveMember)
	r.Post("/:id/links", middleware.RoleRequired("member", "admin", "owner"), handlers.CreateWorkspaceLink)
	r.Get("/:id/links", middleware.RoleRequired("member", "admin", "owner"), handlers.GetLinks)
	r.Patch("/:id/links/:linkId", middleware.RoleRequired("admin", "owner"), handlers.UpdateWorkspaceLink)
	r.Delete("/:id/links/:linkId", middleware.RoleRequired("admin", "owner"), handlers.DeleteWorkspaceLink)
}
