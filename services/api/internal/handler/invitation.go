package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type InvitationHandler struct {
	invitationSvc service.InvitationService
}

func NewInvitationHandler(invitationSvc service.InvitationService) *InvitationHandler {
	return &InvitationHandler{invitationSvc: invitationSvc}
}

func (h *InvitationHandler) List(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	items, err := h.invitationSvc.ListMyInvitations(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取邀约列表失败", err)
		return
	}

	response.Success(c, items)
}

func (h *InvitationHandler) Respond(c *gin.Context) {
	invitationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "无效的邀约 ID", err)
		return
	}

	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	var req dto.RespondInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "邀约操作参数不完整", err)
		return
	}

	item, err := h.invitationSvc.RespondInvitation(
		c.Request.Context(),
		userID,
		uint(invitationID),
		req.Action,
	)
	if err != nil {
		switch err {
		case service.ErrInvitationNotFound:
			response.Error(c, http.StatusNotFound, "邀约不存在", err)
		case service.ErrInvitationForbidden:
			response.Error(c, http.StatusForbidden, err.Error(), err)
		case service.ErrInvitationInvalidAction, service.ErrInvitationAlreadyHandled:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "处理邀约失败", err)
		}
		return
	}

	response.Success(c, item)
}

func (h *InvitationHandler) MessagePreviews(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	items, err := h.invitationSvc.ListMessagePreviews(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取消息列表失败", err)
		return
	}

	response.Success(c, items)
}
