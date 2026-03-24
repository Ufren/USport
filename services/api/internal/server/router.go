package server

import (
	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/handler"
	"github.com/usport/usport-api/internal/middleware"
	"go.uber.org/zap"
)

type RouterDependencies struct {
	Log             *zap.Logger
	JWTSecret       string
	UserHandler     *handler.UserHandler
	ActivityHandler *handler.ActivityHandler
}

func NewRouter(deps RouterDependencies) *gin.Engine {
	router := gin.New()
	router.Use(
		middleware.Logger(deps.Log),
		middleware.Recovery(deps.Log),
		middleware.CORS(),
	)

	api := router.Group("/api/v1")
	{
		api.GET("/health", handler.HealthCheck)

		users := api.Group("/users")
		{
			users.POST("/wechat_login", deps.UserHandler.WechatLogin)
			users.POST("/phone_login", deps.UserHandler.PhoneLogin)
			users.GET("/:id", middleware.Auth(deps.JWTSecret), deps.UserHandler.GetByID)
		}

		activities := api.Group("/activities")
		{
			activities.GET("", deps.ActivityHandler.List)
			activities.GET("/mine", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.Mine)
			activities.GET("/:id", deps.ActivityHandler.Detail)
			activities.POST("", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.Create)
			activities.POST("/:id/register", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.Register)
			activities.POST("/:id/cancel-registration", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.CancelRegistration)
		}
	}

	return router
}
