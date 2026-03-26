package repository

import (
	"context"
	"errors"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
)

type ReportRepository interface {
	Create(ctx context.Context, report *model.Report) error
	ListByReporter(ctx context.Context, userID uint, limit int) ([]model.Report, error)
	FindDuplicateOpen(ctx context.Context, userID uint, targetType string, targetID uint) (*model.Report, error)
}

type CreditRepository interface {
	ListByUser(ctx context.Context, userID uint, limit int) ([]model.CreditRecord, error)
	Create(ctx context.Context, record *model.CreditRecord) error
}

type reportRepository struct {
	db *gorm.DB
}

type creditRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func NewCreditRepository(db *gorm.DB) CreditRepository {
	return &creditRepository{db: db}
}

func (r *reportRepository) Create(ctx context.Context, report *model.Report) error {
	return r.db.WithContext(ctx).Create(report).Error
}

func (r *reportRepository) ListByReporter(ctx context.Context, userID uint, limit int) ([]model.Report, error) {
	var items []model.Report
	err := r.db.WithContext(ctx).
		Where("reporter_user_id = ?", userID).
		Order("created_at desc").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *reportRepository) FindDuplicateOpen(
	ctx context.Context,
	userID uint,
	targetType string,
	targetID uint,
) (*model.Report, error) {
	var item model.Report
	err := r.db.WithContext(ctx).
		Where("reporter_user_id = ?", userID).
		Where("target_type = ?", targetType).
		Where("target_id = ?", targetID).
		Where("status IN ?", []string{model.ReportStatusOpen, model.ReportStatusInReview}).
		First(&item).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *creditRepository) ListByUser(ctx context.Context, userID uint, limit int) ([]model.CreditRecord, error) {
	var items []model.CreditRecord
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *creditRepository) Create(ctx context.Context, record *model.CreditRecord) error {
	return r.db.WithContext(ctx).Create(record).Error
}
