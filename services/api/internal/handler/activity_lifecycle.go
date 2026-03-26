package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

func (h *ActivityHandler) CheckIn(c *gin.Context) {
	activityID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的活动 ID", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	if err := h.activitySvc.CheckInActivity(c.Request.Context(), userID, uint(activityID)); err != nil {
		switch err {
		case service.ErrActivityNotFound:
			response.Error(c, http.StatusNotFound, "活动不存在或你未报名", err)
		case service.ErrActivityAlreadyCheckedIn:
			response.Error(c, http.StatusConflict, err.Error(), err)
		case service.ErrActivityCannotCheckIn:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "签到失败", err)
		}
		return
	}

	response.Success(c, gin.H{"checkedIn": true})
}

func (h *ActivityHandler) Finish(c *gin.Context) {
	activityID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的活动 ID", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	if err := h.activitySvc.FinishActivity(c.Request.Context(), userID, uint(activityID)); err != nil {
		switch err {
		case service.ErrActivityNotFound:
			response.Error(c, http.StatusNotFound, "活动不存在", err)
		case service.ErrActivityNotHost:
			response.Error(c, http.StatusForbidden, err.Error(), err)
		case service.ErrActivityCannotFinish:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "完赛处理失败", err)
		}
		return
	}

	response.Success(c, gin.H{"finished": true})
}
