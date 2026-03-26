package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type AdminHandler struct {
	adminSvc service.AdminService
}

func NewAdminHandler(adminSvc service.AdminService) *AdminHandler {
	return &AdminHandler{adminSvc: adminSvc}
}

func (h *AdminHandler) Dashboard(c *gin.Context) {
	item, err := h.adminSvc.GetDashboard(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取后台总览失败", err)
		return
	}

	response.Success(c, item)
}

func (h *AdminHandler) Reports(c *gin.Context) {
	items, err := h.adminSvc.ListReports(c.Request.Context(), c.Query("status"))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取举报工单失败", err)
		return
	}

	response.Success(c, items)
}

func (h *AdminHandler) CreateOfficialActivity(c *gin.Context) {
	var req dto.CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "官方活动参数不完整", err)
		return
	}

	operator := strings.TrimSpace(c.GetHeader("X-Admin-Operator"))
	item, err := h.adminSvc.CreateOfficialActivity(c.Request.Context(), operator, req)
	if err != nil {
		switch err {
		case service.ErrAdminOperatorNameInvalid:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		}
		return
	}

	response.Success(c, item)
}

func (h *AdminHandler) DecideReport(c *gin.Context) {
	reportID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "举报工单 ID 无效", err)
		return
	}

	var req dto.AdminReportDecisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "后台处理参数不完整", err)
		return
	}

	operator := strings.TrimSpace(c.GetHeader("X-Admin-Operator"))
	item, err := h.adminSvc.DecideReport(c.Request.Context(), operator, uint(reportID), req)
	if err != nil {
		switch err {
		case service.ErrAdminReportNotFound:
			response.Error(c, http.StatusNotFound, err.Error(), err)
		case service.ErrAdminDecisionInvalid, service.ErrAdminOperatorNameInvalid:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "提交后台处理失败", err)
		}
		return
	}

	response.Success(c, item)
}

func (h *AdminHandler) MembershipOrders(c *gin.Context) {
	items, err := h.adminSvc.ListMembershipOrders(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取会员订单失败", err)
		return
	}

	response.Success(c, items)
}

func (h *AdminHandler) AuditLogs(c *gin.Context) {
	items, err := h.adminSvc.ListAuditLogs(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取后台审计日志失败", err)
		return
	}

	response.Success(c, items)
}
