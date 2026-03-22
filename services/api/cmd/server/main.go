package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/usport/usport-api/dal/query"
	"github.com/usport/usport-api/internal/config"
	"github.com/usport/usport-api/internal/handler"
	"github.com/usport/usport-api/internal/middleware"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/database"
	"github.com/usport/usport-api/pkg/logger"
	"github.com/usport/usport-api/pkg/redis"
	"github.com/usport/usport-api/pkg/wechat"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()
	log := logger.New(cfg.Log.Level, cfg.Log.Encoding)
	ctx := context.Background()

	db, err := database.NewMySQL(database.Config{
		Host:         cfg.DB.Host,
		Port:         cfg.DB.Port,
		User:         cfg.DB.User,
		Password:     cfg.DB.Password,
		DBName:       cfg.DB.Name,
		MaxOpenConns: cfg.DB.MaxOpenConns,
		MaxIdleConns: cfg.DB.MaxIdleConns,
		ConnMaxLife:  time.Duration(cfg.DB.ConnMaxLife) * time.Second,
	})
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	rdb := redis.NewClient(redis.Config{
		Host:     cfg.Redis.Host,
		Port:     cfg.Redis.Port,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
		PoolSize: cfg.Redis.PoolSize,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal("failed to connect to redis", zap.Error(err))
	}
	defer rdb.Close()

	wechatSvc := wechat.NewWechatService(&cfg.Wechat)
	dbQuery := query.NewQuery(db)

	userSvc := service.NewUserService(dbQuery, wechatSvc, rdb, cfg.JWT.Secret, cfg.JWT.Expire)
	userHandler := handler.NewUserHandler(userSvc)

	router := gin.New()
	router.Use(middleware.Logger(log), middleware.Recovery(log), middleware.CORS())

	api := router.Group("/api/v1")
	{
		api.GET("/health", handler.HealthCheck)

		users := api.Group("/users")
		{
			users.POST("/wechat_login", userHandler.WechatLogin)
			users.POST("/phone_login", userHandler.PhoneLogin)
			users.GET("/:id", middleware.Auth(cfg.JWT.Secret), userHandler.GetByID)
		}
	}

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	go func() {
		log.Info("starting server", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("server forced to shutdown", zap.Error(err))
	}

	log.Info("server exited")
}
