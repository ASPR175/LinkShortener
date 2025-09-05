package auth

import (
	"log"
	"os"

	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

func InitOAuth() {
	baseCallback := os.Getenv("OAUTH_CALLBACK_URL")
	if baseCallback == "" {
		log.Fatal("OAUTH_CALLBACK_URL not set")
	}

	goth.UseProviders(
		google.New(
			os.Getenv("OAUTH_GOOGLE_CLIENT_ID"),
			os.Getenv("OAUTH_GOOGLE_CLIENT_SECRET"),
			baseCallback+"/google/callback",
			"email", "profile",
		),
		github.New(
			os.Getenv("OAUTH_GITHUB_CLIENT_ID"),
			os.Getenv("OAUTH_GITHUB_CLIENT_SECRET"),
			baseCallback+"/github/callback",
			"user:email",
		),
	)

	log.Println("✅ OAuth providers initialized")
}
