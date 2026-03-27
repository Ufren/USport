package server

import (
	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/handler"
	"github.com/usport/usport-api/internal/middleware"
	"go.uber.org/zap"
)

type RouterDependencies struct {
	Log               *zap.Logger
	JWTSecret         string
	UserHandler       *handler.UserHandler
	ActivityHandler   *handler.ActivityHandler
	InvitationHandler *handler.InvitationHandler
	GovernanceHandler *handler.GovernanceHandler
	MembershipHandler *handler.MembershipHandler
	AdminHandler      *handler.AdminHandler
	AdminToken        string
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
			activities.POST("/:id/check-in", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.CheckIn)
			activities.POST("/:id/finish", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.Finish)
			activities.POST("/:id/cancel-registration", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.CancelRegistration)
			activities.POST("/:id/cancel", middleware.Auth(deps.JWTSecret), deps.ActivityHandler.CancelActivity)
		}

		invitations := api.Group("/invitations", middleware.Auth(deps.JWTSecret))
		{
			invitations.GET("", deps.InvitationHandler.List)
			invitations.POST("/:id/respond", deps.InvitationHandler.Respond)
		}

		messages := api.Group("/messages", middleware.Auth(deps.JWTSecret))
		{
			messages.GET("", deps.InvitationHandler.MessagePreviews)
			messages.GET("/workspace", deps.InvitationHandler.InboxWorkspace)
		}

		governance := api.Group("", middleware.Auth(deps.JWTSecret))
		{
			governance.GET("/users/me/credit-summary", deps.GovernanceHandler.CreditSummary)
			governance.GET("/reports", deps.GovernanceHandler.ListMyReports)
			governance.POST("/reports", deps.GovernanceHandler.CreateReport)
			governance.GET("/membership/plans", deps.MembershipHandler.ListPlans)
			governance.GET("/membership/summary", deps.MembershipHandler.Summary)
			governance.GET("/membership/orders", deps.MembershipHandler.ListOrders)
			governance.POST("/membership/orders", deps.MembershipHandler.CreateOrder)
			governance.POST("/membership/orders/:id/mock-pay", deps.MembershipHandler.MockPayOrder)
		}

		admin := api.Group("/admin", middleware.AdminAuth(deps.AdminToken))
		{
			admin.GET("/dashboard", deps.AdminHandler.Dashboard)
			admin.GET("/activities", deps.AdminHandler.Activities)
			admin.POST("/activities", deps.AdminHandler.CreateOfficialActivity)
			admin.GET("/reports", deps.AdminHandler.Reports)
			admin.POST("/reports/:id/decision", deps.AdminHandler.DecideReport)
			admin.GET("/membership/orders", deps.AdminHandler.MembershipOrders)
			admin.POST("/membership/orders/:id/refund", deps.AdminHandler.RefundMembershipOrder)
			admin.GET("/audit-logs", deps.AdminHandler.AuditLogs)
		}
	}

	return router
}
