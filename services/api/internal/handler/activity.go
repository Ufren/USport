package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/middleware"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type ActivityHandler struct {
	activitySvc service.ActivityService
}

func NewActivityHandler(activitySvc service.ActivityService) *ActivityHandler {
	return &ActivityHandler{activitySvc: activitySvc}
}

func (h *ActivityHandler) List(c *gin.Context) {
	items, err := h.activitySvc.ListActivities(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取活动列表失败", err)
		return
	}

	response.Success(c, items)
}

func (h *ActivityHandler) Mine(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	role := c.Query("role")
	if role != "" && role != "all" && role != "host" && role != "participant" {
		response.Error(c, http.StatusBadRequest, "无效的活动角色筛选", nil)
		return
	}

	items, err := h.activitySvc.ListMyActivities(c.Request.Context(), userID, role)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取我的活动失败", err)
		return
	}

	response.Success(c, items)
}

func (h *ActivityHandler) Detail(c *gin.Context) {
	activityID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的活动 ID", err)
		return
	}

	detail, err := h.activitySvc.GetActivityDetail(c.Request.Context(), uint(activityID))
	if err != nil {
		if err == service.ErrActivityNotFound {
			response.Error(c, http.StatusNotFound, "活动不存在", err)
			return
		}
		response.Error(c, http.StatusInternalServerError, "获取活动详情失败", err)
		return
	}

	response.Success(c, detail)
}

func (h *ActivityHandler) Create(c *gin.Context) {
	var req dto.CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "活动参数不完整", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	detail, err := h.activitySvc.CreateActivity(c.Request.Context(), userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	response.Success(c, detail)
}

func (h *ActivityHandler) Register(c *gin.Context) {
	activityID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的活动 ID", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	result, err := h.activitySvc.RegisterActivity(c.Request.Context(), userID, uint(activityID))
	if err != nil {
		switch err {
		case service.ErrActivityNotFound:
			response.Error(c, http.StatusNotFound, "活动不存在", err)
		case service.ErrActivityAlreadyJoined:
			response.Error(c, http.StatusConflict, "你已加入该活动", err)
		case service.ErrActivityCapacityFull:
			response.Error(c, http.StatusConflict, "活动已满员", err)
		default:
			response.Error(c, http.StatusInternalServerError, "报名失败，请稍后再试", err)
		}
		return
	}

	response.Success(c, result)
}

func (h *ActivityHandler) CancelRegistration(c *gin.Context) {
	activityID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的活动 ID", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	if err := h.activitySvc.CancelRegistration(c.Request.Context(), userID, uint(activityID)); err != nil {
		if err == service.ErrActivityNotFound {
			response.Error(c, http.StatusNotFound, "活动不存在或未报名", err)
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	response.Success(c, gin.H{"cancelled": true})
}

func currentUserID(c *gin.Context) (uint, bool) {
	userIDValue, exists := c.Get(middleware.UserIDKey)
	if !exists {
		response.Unauthorized(c, "请先登录")
		return 0, false
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		response.Unauthorized(c, "登录信息无效")
		return 0, false
	}

	return userID, true
}
