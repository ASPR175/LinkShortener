package routes

import (
	"linkshortener/handlers"

	"github.com/gofiber/fiber/v2"
)

func Redirect(app *fiber.App) {
	app.Get("/:short_id", handlers.Redirect)
}
