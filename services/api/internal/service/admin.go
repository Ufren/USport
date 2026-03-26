package service

import (
	"context"
	"errors"
	"strings"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/assembler"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

var (
	ErrAdminReportNotFound      = errors.New("举报工单不存在")
	ErrAdminDecisionInvalid     = errors.New("后台处理结论不合法")
	ErrAdminOperatorNameInvalid = errors.New("后台操作人不能为空")
)

type AdminService interface {
	GetDashboard(ctx context.Context) (*dto.AdminDashboardSummary, error)
	ListReports(ctx context.Context, status string) ([]dto.AdminReportItem, error)
	CreateOfficialActivity(ctx context.Context, operator string, req dto.CreateActivityRequest) (*dto.AdminOfficialActivityItem, error)
	DecideReport(ctx context.Context, operator string, reportID uint, req dto.AdminReportDecisionRequest) (*dto.AdminReportItem, error)
	ListMembershipOrders(ctx context.Context) ([]dto.AdminMembershipOrderItem, error)
	ListAuditLogs(ctx context.Context) ([]dto.AdminAuditLogItem, error)
}

type adminService struct {
	adminRepo    repository.AdminRepository
	activityRepo repository.ActivityRepository
}

func NewAdminService(
	adminRepo repository.AdminRepository,
	activityRepo repository.ActivityRepository,
) AdminService {
	return &adminService{
		adminRepo:    adminRepo,
		activityRepo: activityRepo,
	}
}

func (s *adminService) GetDashboard(ctx context.Context) (*dto.AdminDashboardSummary, error) {
	counters, err := s.adminRepo.GetDashboardCounters(ctx)
	if err != nil {
		return nil, err
	}

	result := assembler.ToAdminDashboardSummary(dto.AdminDashboardSummary{
		UsersTotal:          counters.UsersTotal,
		PublishedActivities: counters.PublishedActivities,
		OpenReports:         counters.OpenReports,
		InReviewReports:     counters.InReviewReports,
		PaidOrders:          counters.PaidOrders,
		ActiveMembers:       counters.ActiveMembers,
	})
	return &result, nil
}

func (s *adminService) ListReports(ctx context.Context, status string) ([]dto.AdminReportItem, error) {
	items, err := s.adminRepo.ListReports(ctx, strings.TrimSpace(status), 50)
	if err != nil {
		return nil, err
	}

	result := make([]dto.AdminReportItem, 0, len(items))
	for _, item := range items {
		result = append(result, assembler.ToAdminReportItem(item))
	}
	return result, nil
}

func (s *adminService) CreateOfficialActivity(
	ctx context.Context,
	operator string,
	req dto.CreateActivityRequest,
) (*dto.AdminOfficialActivityItem, error) {
	operator = strings.TrimSpace(operator)
	if operator == "" {
		return nil, ErrAdminOperatorNameInvalid
	}

	activity, err := createActivityRecord(ctx, s.activityRepo, 1, req, true)
	if err != nil {
		return nil, err
	}

	if err := s.adminRepo.CreateAuditLog(ctx, &model.AdminAuditLog{
		Operator:   operator,
		ActionCode: "official_activity_created",
		TargetType: "activity",
		TargetID:   activity.ID,
		Detail:     activity.Title,
	}); err != nil {
		return nil, err
	}

	counts, err := s.activityRepo.CountParticipants(ctx, []uint{activity.ID})
	if err != nil {
		return nil, err
	}

	return &dto.AdminOfficialActivityItem{
		ID:              activity.ID,
		Title:           activity.Title,
		SportLabel:      activity.SportLabel,
		StartTimeLabel:  activity.StartAt.Format("2006-01-02 15:04"),
		VenueName:       activity.VenueName,
		District:        activity.District,
		ParticipantHint: assembler.FormatParticipantSummary(activity.Capacity, activity.WaitlistCapacity, counts[activity.ID]),
	}, nil
}

func (s *adminService) DecideReport(
	ctx context.Context,
	operator string,
	reportID uint,
	req dto.AdminReportDecisionRequest,
) (*dto.AdminReportItem, error) {
	operator = strings.TrimSpace(operator)
	if operator == "" {
		return nil, ErrAdminOperatorNameInvalid
	}

	nextStatus, actionCode, err := mapAdminDecision(strings.TrimSpace(req.Decision))
	if err != nil {
		return nil, err
	}

	reportItem, err := s.adminRepo.FindReportByID(ctx, reportID)
	if err != nil {
		return nil, err
	}
	if reportItem == nil {
		return nil, ErrAdminReportNotFound
	}

	if err := s.adminRepo.UpdateReportStatus(ctx, reportID, nextStatus); err != nil {
		return nil, err
	}

	// 只有对用户本身的有效举报才直接扣分，避免在活动举报场景下误伤无关参与者。
	if nextStatus == model.ReportStatusResolvedValid && reportItem.TargetType == "user" {
		if err := s.adminRepo.AddCreditRecord(ctx, &model.CreditRecord{
			UserID:      reportItem.TargetID,
			EventCode:   model.CreditEventReportValid,
			Delta:       -10,
			Description: "后台判定举报成立，信用分下调",
		}); err != nil {
			return nil, err
		}
	}

	if err := s.adminRepo.CreateAuditLog(ctx, &model.AdminAuditLog{
		Operator:   operator,
		ActionCode: actionCode,
		TargetType: "report",
		TargetID:   reportItem.ID,
		Detail:     strings.TrimSpace(req.Note),
	}); err != nil {
		return nil, err
	}

	reportItem.Status = nextStatus
	result := assembler.ToAdminReportItem(*reportItem)
	return &result, nil
}

func (s *adminService) ListMembershipOrders(ctx context.Context) ([]dto.AdminMembershipOrderItem, error) {
	items, err := s.adminRepo.ListMembershipOrders(ctx, 50)
	if err != nil {
		return nil, err
	}

	result := make([]dto.AdminMembershipOrderItem, 0, len(items))
	for _, item := range items {
		result = append(result, assembler.ToAdminMembershipOrderItem(item))
	}
	return result, nil
}

func (s *adminService) ListAuditLogs(ctx context.Context) ([]dto.AdminAuditLogItem, error) {
	items, err := s.adminRepo.ListAuditLogs(ctx, 50)
	if err != nil {
		return nil, err
	}

	result := make([]dto.AdminAuditLogItem, 0, len(items))
	for _, item := range items {
		result = append(result, assembler.ToAdminAuditLogItem(item))
	}
	return result, nil
}

func mapAdminDecision(decision string) (string, string, error) {
	switch decision {
	case "in_review":
		return model.ReportStatusInReview, "report_in_review", nil
	case "resolved_valid":
		return model.ReportStatusResolvedValid, "report_resolved_valid", nil
	case "resolved_invalid":
		return model.ReportStatusResolvedInvalid, "report_resolved_invalid", nil
	case "closed":
		return model.ReportStatusClosed, "report_closed", nil
	default:
		return "", "", ErrAdminDecisionInvalid
	}
}
