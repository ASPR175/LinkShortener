package main

import (
	"log"
	"os"

	"linkshortener/auth"
	"linkshortener/db"
	"linkshortener/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env vars")
	}

	db.InitMongo()
	db.InitRedis()
	auth.InitOAuth()
	app := fiber.New()
	app.Use(logger.New())
	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://localhost:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))

	routes.AuthRoutes(app)
	routes.LinkRoutes(app)
	routes.AnalyticsRoutes(app)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Println("Server running on port " + port)
	log.Fatal(app.Listen(":" + port))
}
