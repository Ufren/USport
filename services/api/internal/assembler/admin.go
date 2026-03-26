package assembler

import (
	"fmt"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
)

func ToAdminDashboardSummary(counters dto.AdminDashboardSummary) dto.AdminDashboardSummary {
	return counters
}

func ToAdminReportItem(item model.Report) dto.AdminReportItem {
	return dto.AdminReportItem{
		ID:             item.ID,
		ReporterUserID: item.ReporterUserID,
		ReporterName:   item.ReporterUser.Nickname,
		TargetType:     item.TargetType,
		TargetID:       item.TargetID,
		ReasonCode:     item.ReasonCode,
		Description:    item.Description,
		Status:         item.Status,
		StatusLabel:    mapReportStatusLabel(item.Status),
		CreatedAtLabel: item.CreatedAt.Format("2006-01-02 15:04"),
		CanResolve:     item.Status == model.ReportStatusOpen || item.Status == model.ReportStatusInReview,
		CanEscalate:    item.Status == model.ReportStatusOpen || item.Status == model.ReportStatusInReview,
	}
}

func ToAdminMembershipOrderItem(item model.PaymentOrder) dto.AdminMembershipOrderItem {
	return dto.AdminMembershipOrderItem{
		ID:          item.ID,
		UserID:      item.UserID,
		PlanCode:    item.PlanCode,
		AmountLabel: fmt.Sprintf("¥%.2f", float64(item.AmountCents)/100),
		Status:      item.Status,
		StatusLabel: mapOrderStatusLabel(item.Status),
		CreatedAt:   item.CreatedAt.Format("2006-01-02 15:04"),
	}
}

func ToAdminAuditLogItem(item model.AdminAuditLog) dto.AdminAuditLogItem {
	return dto.AdminAuditLogItem{
		ID:         item.ID,
		Operator:   item.Operator,
		ActionCode: item.ActionCode,
		TargetType: item.TargetType,
		TargetID:   item.TargetID,
		Detail:     item.Detail,
		CreatedAt:  item.CreatedAt.Format("2006-01-02 15:04"),
	}
}
