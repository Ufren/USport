package redis

import (
	"context"

	"github.com/go-redis/redis/v8"
)

type Config struct {
	Host     string
	Port     int
	Password string
	DB       int
	PoolSize int
}

func NewClient(cfg Config) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     cfg.Host,
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	})
}

func Ping(ctx context.Context, client *redis.Client) error {
	return client.Ping(ctx).Err()
}
