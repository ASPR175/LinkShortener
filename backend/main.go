package main

import (
	"log"
	"os"

	"linkshortener/auth"
	"linkshortener/db"
	"linkshortener/routes"
	"linkshortener/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/joho/godotenv"
)

var store = session.New()

func main() {
	utils.InitGeoIP()
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env vars")
	}

	db.InitMongo()
	db.InitRedis()
	auth.InitOAuth()
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))
	app.Use(func(c *fiber.Ctx) error {
		sess, _ := store.Get(c)
		c.Locals("session", sess)
		return c.Next()
	})
	routes.AuthRoutes(app)
	routes.LinkRoutes(app)
	routes.Redirect(app)
	routes.ClickEventRoutes(app)
	routes.ApikeyRoutes(app)
	routes.WorkspaceRoutes(app)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port " + port)
	log.Fatal(app.Listen(":" + port))
}
