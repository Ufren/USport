package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type UserHandler struct {
	userSvc service.UserService
}

func NewUserHandler(userSvc service.UserService) *UserHandler {
	return &UserHandler{userSvc: userSvc}
}

func (h *UserHandler) WechatLogin(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		response.Error(c, http.StatusBadRequest, "缺少code参数", nil)
		return
	}

	result, err := h.userSvc.WechatLogin(c.Request.Context(), code)
	if err != nil {
		if err == service.ErrInvalidWechatCode {
			response.Error(c, http.StatusUnauthorized, "微信授权失败", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "登录失败", err)
		return
	}

	response.Success(c, result)
}

func (h *UserHandler) PhoneLogin(c *gin.Context) {
	var req service.PhoneLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数错误", err)
		return
	}

	result, err := h.userSvc.PhoneLogin(c.Request.Context(), req)
	if err != nil {
		if err == service.ErrInvalidWechatCode || err == service.ErrPhoneAuthFailed {
			response.Error(c, http.StatusUnauthorized, "手机号授权失败", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "登录失败", err)
		return
	}

	response.Success(c, result)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的用户ID", err)
		return
	}

	user, err := h.userSvc.GetUserByID(c.Request.Context(), uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			response.Error(c, http.StatusNotFound, "用户不存在", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "获取用户信息失败", err)
		return
	}

	response.Success(c, user)
}

func HealthCheck(c *gin.Context) {
	response.Success(c, gin.H{"status": "ok"})
}
