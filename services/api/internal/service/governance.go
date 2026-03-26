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
	ErrDuplicateReport    = errors.New("请勿重复提交同一对象的处理中举报")
	ErrInvalidReportInput = errors.New("举报参数不完整或不合法")
)

type GovernanceService interface {
	CreateReport(ctx context.Context, userID uint, req dto.CreateReportRequest) (*dto.ReportItem, error)
	ListMyReports(ctx context.Context, userID uint) ([]dto.ReportItem, error)
	GetCreditSummary(ctx context.Context, userID uint) (*dto.CreditSummary, error)
}

type governanceService struct {
	reportRepo repository.ReportRepository
	creditRepo repository.CreditRepository
}

func NewGovernanceService(
	reportRepo repository.ReportRepository,
	creditRepo repository.CreditRepository,
) GovernanceService {
	return &governanceService{
		reportRepo: reportRepo,
		creditRepo: creditRepo,
	}
}

func (s *governanceService) CreateReport(
	ctx context.Context,
	userID uint,
	req dto.CreateReportRequest,
) (*dto.ReportItem, error) {
	targetType := strings.TrimSpace(req.TargetType)
	reasonCode := strings.TrimSpace(req.ReasonCode)
	if userID == 0 || targetType == "" || req.TargetID == 0 || reasonCode == "" {
		return nil, ErrInvalidReportInput
	}

	existing, err := s.reportRepo.FindDuplicateOpen(ctx, userID, targetType, req.TargetID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrDuplicateReport
	}

	item := &model.Report{
		ReporterUserID: userID,
		TargetType:     targetType,
		TargetID:       req.TargetID,
		ReasonCode:     reasonCode,
		Description:    strings.TrimSpace(req.Description),
		Status:         model.ReportStatusOpen,
	}
	if err := s.reportRepo.Create(ctx, item); err != nil {
		return nil, err
	}

	result := assembler.ToReportItem(*item)
	return &result, nil
}

func (s *governanceService) ListMyReports(ctx context.Context, userID uint) ([]dto.ReportItem, error) {
	items, err := s.reportRepo.ListByReporter(ctx, userID, 30)
	if err != nil {
		return nil, err
	}

	result := make([]dto.ReportItem, 0, len(items))
	for _, item := range items {
		result = append(result, assembler.ToReportItem(item))
	}

	return result, nil
}

func (s *governanceService) GetCreditSummary(ctx context.Context, userID uint) (*dto.CreditSummary, error) {
	items, err := s.creditRepo.ListByUser(ctx, userID, 20)
	if err != nil {
		return nil, err
	}

	result := assembler.BuildCreditSummary(items)
	return &result, nil
}
