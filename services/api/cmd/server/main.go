package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/config"
	"github.com/usport/usport-api/internal/handler"
	"github.com/usport/usport-api/internal/repository"
	appserver "github.com/usport/usport-api/internal/server"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/buildinfo"
	"github.com/usport/usport-api/pkg/database"
	"github.com/usport/usport-api/pkg/logger"
	"github.com/usport/usport-api/pkg/redis"
	"github.com/usport/usport-api/pkg/wechat"
	"go.uber.org/zap"
	"gorm.io/gorm"
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
	if err := db.AutoMigrate(
		&model.User{},
		&model.Activity{},
		&model.ActivityParticipant{},
		&model.Invitation{},
		&model.Report{},
		&model.CreditRecord{},
		&model.MembershipPlan{},
		&model.Subscription{},
		&model.PaymentOrder{},
		&model.AdminAuditLog{},
	); err != nil {
		log.Fatal("failed to migrate database schema", zap.Error(err))
	}
	defer closeDB(db)

	rdb := redis.NewClient(redis.Config{
		Host:     cfg.Redis.Host,
		Port:     cfg.Redis.Port,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
		PoolSize: cfg.Redis.PoolSize,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Warn("failed to connect to redis, cache disabled", zap.Error(err))
		rdb = nil
	}
	if rdb != nil {
		defer rdb.Close()
	}

	wechatSvc := wechat.NewWechatService(&cfg.Wechat)
	userRepo := repository.NewUserRepository(db)
	activityRepo := repository.NewActivityRepository(db)
	invitationRepo := repository.NewInvitationRepository(db)
	reportRepo := repository.NewReportRepository(db)
	creditRepo := repository.NewCreditRepository(db)
	membershipRepo := repository.NewMembershipRepository(db)
	adminRepo := repository.NewAdminRepository(db)

	userSvc := service.NewUserService(userRepo, wechatSvc, rdb, cfg.JWT.Secret, cfg.JWT.Expire)
	activitySvc := service.NewActivityService(activityRepo)
	invitationSvc := service.NewInvitationService(db, invitationRepo, activityRepo)
	governanceSvc := service.NewGovernanceService(reportRepo, creditRepo)
	membershipSvc := service.NewMembershipService(membershipRepo)
	adminSvc := service.NewAdminService(adminRepo, activityRepo)

	userHandler := handler.NewUserHandler(userSvc)
	activityHandler := handler.NewActivityHandler(activitySvc)
	invitationHandler := handler.NewInvitationHandler(invitationSvc)
	governanceHandler := handler.NewGovernanceHandler(governanceSvc)
	membershipHandler := handler.NewMembershipHandler(membershipSvc)
	adminHandler := handler.NewAdminHandler(adminSvc)

	router := appserver.NewRouter(appserver.RouterDependencies{
		Log:               log,
		JWTSecret:         cfg.JWT.Secret,
		UserHandler:       userHandler,
		ActivityHandler:   activityHandler,
		InvitationHandler: invitationHandler,
		GovernanceHandler: governanceHandler,
		MembershipHandler: membershipHandler,
		AdminHandler:      adminHandler,
		AdminToken:        cfg.Admin.Token,
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	go func() {
		log.Info(
			"starting server",
			zap.String("addr", srv.Addr),
			zap.String("version", buildinfo.Version),
			zap.String("commit", buildinfo.Commit),
			zap.String("build_time", buildinfo.BuildTime),
		)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("server forced to shutdown", zap.Error(err))
	}

	log.Info("server exited")
}

func closeDB(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		return
	}
	_ = sqlDB.Close()
}
