package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis() {
	uri := os.Getenv("REDIS_URI")
	if uri == "" {
		log.Fatal("REDIS_URI not set")
	}

	opt, err := redis.ParseURL(uri)
	if err != nil {
		log.Fatal("Redis parse error: ", err)
	}

	RedisClient = redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		log.Fatal("Redis ping failed: ", err)
	}

	log.Println("✅ Redis connected")
}
