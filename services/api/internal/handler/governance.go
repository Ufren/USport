package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/service"
	"github.com/usport/usport-api/pkg/response"
)

type GovernanceHandler struct {
	governanceSvc service.GovernanceService
}

func NewGovernanceHandler(governanceSvc service.GovernanceService) *GovernanceHandler {
	return &GovernanceHandler{governanceSvc: governanceSvc}
}

func (h *GovernanceHandler) CreateReport(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	var req dto.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "举报参数不完整", err)
		return
	}

	item, err := h.governanceSvc.CreateReport(c.Request.Context(), userID, req)
	if err != nil {
		switch err {
		case service.ErrInvalidReportInput:
			response.Error(c, http.StatusBadRequest, err.Error(), err)
		case service.ErrDuplicateReport:
			response.Error(c, http.StatusConflict, err.Error(), err)
		default:
			response.Error(c, http.StatusInternalServerError, "举报提交失败", err)
		}
		return
	}

	response.Success(c, item)
}

func (h *GovernanceHandler) ListMyReports(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	items, err := h.governanceSvc.ListMyReports(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取举报列表失败", err)
		return
	}

	response.Success(c, items)
}

func (h *GovernanceHandler) CreditSummary(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		return
	}

	item, err := h.governanceSvc.GetCreditSummary(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取信用摘要失败", err)
		return
	}

	response.Success(c, item)
}
