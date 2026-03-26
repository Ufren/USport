package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type MembershipHandler struct {
	membershipSvc service.MembershipService
}

func NewMembershipHandler(membershipSvc service.MembershipService) *MembershipHandler {
	return &MembershipHandler{membershipSvc: membershipSvc}
}

func (h *MembershipHandler) ListPlans(c *gin.Context) {
	items, err := h.membershipSvc.ListPlans(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取会员套餐失败", err)
		return
	}

	response.Success(c, items)
}

func (h *MembershipHandler) Summary(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	item, err := h.membershipSvc.GetSummary(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取会员状态失败", err)
		return
	}

	response.Success(c, item)
}

func (h *MembershipHandler) CreateOrder(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	var req dto.CreateMembershipOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "会员订单参数不完整", err)
		return
	}

	item, err := h.membershipSvc.CreateOrder(c.Request.Context(), userID, req)
	if err != nil {
		switch err {
		case service.ErrMembershipPlanInvalid:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "创建会员订单失败", err)
		}
		return
	}

	response.Success(c, item)
}

func (h *MembershipHandler) ListOrders(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	items, err := h.membershipSvc.ListOrders(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取会员订单失败", err)
		return
	}

	response.Success(c, items)
}
