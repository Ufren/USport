package assembler

import (
	"fmt"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

func ToAdminDashboardSummary(counters dto.AdminDashboardSummary) dto.AdminDashboardSummary {
	return counters
}

func ToAdminActivityItem(
	item model.Activity,
	count repository.ParticipantCounters,
) dto.AdminActivityItem {
	status := DeriveActivityStatus(item, count)

	return dto.AdminActivityItem{
		ID:              item.ID,
		Title:           item.Title,
		IsOfficial:      item.IsOfficial,
		HostName:        fallbackUserName(item.HostUser),
		SportLabel:      item.SportLabel,
		Status:          status,
		StatusLabel:     mapAdminActivityStatusLabel(status),
		StartTimeLabel:  item.StartAt.Format("2006-01-02 15:04"),
		VenueName:       item.VenueName,
		District:        item.District,
		ParticipantHint: FormatParticipantSummary(item.Capacity, item.WaitlistCapacity, count),
	}
}

func mapAdminActivityStatusLabel(status string) string {
	switch status {
	case model.ActivityStatusFull:
		return "名额紧张"
	case model.ActivityStatusSignupClosed:
		return "报名截止"
	case model.ActivityStatusOngoing:
		return "进行中"
	case model.ActivityStatusCompleted:
		return "已完成"
	case model.ActivityStatusCancelled:
		return "已取消"
	default:
		return "报名中"
	}
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
		CanRefund:   item.Status == model.OrderStatusPaid,
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
