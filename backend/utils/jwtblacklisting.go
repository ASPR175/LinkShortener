package utils

import (
	"context"
	"time"

	"linkshortener/db"
)

var ctx = context.Background()

func BlacklistToken(token string, exp time.Duration) error {
	ctx := context.Background()
	return db.RedisClient.Set(ctx, token, "blacklisted", exp).Err()
}

func IsTokenBlacklisted(token string) (bool, error) {
	val, err := db.RedisClient.Get(ctx, token).Result()
	if err != nil {
		if err.Error() == "redis: nil" {
			return false, nil
		}
		return false, err
	}
	return val == "blacklisted", nil
}
