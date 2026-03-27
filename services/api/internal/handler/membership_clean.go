package handler

import (
	"net/http"
	"strconv"

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
			response.Error(c, http.StatusBadRequest, "会员套餐不存在或暂不可购买", err)
		default:
			response.Error(c, http.StatusInternalServerError, "创建会员订单失败", err)
		}
		return
	}

	response.Success(c, item)
}

func (h *MembershipHandler) MockPayOrder(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "会员订单 ID 无效", err)
		return
	}

	item, err := h.membershipSvc.MockPayOrder(c.Request.Context(), userID, uint(orderID))
	if err != nil {
		switch err {
		case service.ErrMembershipOrderInvalid:
			response.Error(c, http.StatusNotFound, "会员订单不存在", err)
		case service.ErrMembershipOrderPaid:
			response.Error(c, http.StatusBadRequest, "会员订单已支付", err)
		case service.ErrMembershipOrderClosed:
			response.Error(c, http.StatusBadRequest, "会员订单当前状态不支持支付", err)
		case service.ErrMembershipPlanInvalid:
			response.Error(c, http.StatusBadRequest, "会员套餐不存在或暂不可购买", err)
		default:
			response.Error(c, http.StatusInternalServerError, "会员订单支付失败", err)
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
