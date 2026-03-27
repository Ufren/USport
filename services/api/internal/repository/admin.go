package repository

import (
	"context"
	"errors"
	"time"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
)

type AdminDashboardCounters struct {
	UsersTotal          int64
	PublishedActivities int64
	OpenReports         int64
	InReviewReports     int64
	PaidOrders          int64
	ActiveMembers       int64
}

type AdminRepository interface {
	GetDashboardCounters(ctx context.Context) (AdminDashboardCounters, error)
	ListActivities(ctx context.Context, limit int) ([]model.Activity, error)
	ListReports(ctx context.Context, status string, limit int) ([]model.Report, error)
	FindReportByID(ctx context.Context, reportID uint) (*model.Report, error)
	UpdateReportStatus(ctx context.Context, reportID uint, status string) error
	AddCreditRecord(ctx context.Context, record *model.CreditRecord) error
	ListMembershipOrders(ctx context.Context, limit int) ([]model.PaymentOrder, error)
	FindMembershipOrderByID(ctx context.Context, orderID uint) (*model.PaymentOrder, error)
	UpdateMembershipOrderStatus(ctx context.Context, orderID uint, status string) error
	CreateAuditLog(ctx context.Context, log *model.AdminAuditLog) error
	ListAuditLogs(ctx context.Context, limit int) ([]model.AdminAuditLog, error)
}

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) GetDashboardCounters(ctx context.Context) (AdminDashboardCounters, error) {
	result := AdminDashboardCounters{}

	queries := []struct {
		model any
		where string
		args  []any
		dest  *int64
	}{
		{model: &model.User{}, dest: &result.UsersTotal},
		{model: &model.Activity{}, where: "status = ?", args: []any{model.ActivityStatusPublished}, dest: &result.PublishedActivities},
		{model: &model.Report{}, where: "status = ?", args: []any{model.ReportStatusOpen}, dest: &result.OpenReports},
		{model: &model.Report{}, where: "status = ?", args: []any{model.ReportStatusInReview}, dest: &result.InReviewReports},
		{model: &model.PaymentOrder{}, where: "status = ?", args: []any{model.OrderStatusPaid}, dest: &result.PaidOrders},
	}

	for _, query := range queries {
		dbQuery := r.db.WithContext(ctx).Model(query.model)
		if query.where != "" {
			dbQuery = dbQuery.Where(query.where, query.args...)
		}
		if err := dbQuery.Count(query.dest).Error; err != nil {
			return result, err
		}
	}

	if err := r.db.WithContext(ctx).
		Model(&model.Subscription{}).
		Where("status = ? AND expire_at > ?", model.SubscriptionStatusActive, time.Now()).
		Count(&result.ActiveMembers).Error; err != nil {
		return result, err
	}

	return result, nil
}

func (r *adminRepository) ListActivities(ctx context.Context, limit int) ([]model.Activity, error) {
	var items []model.Activity
	err := r.db.WithContext(ctx).
		Preload("HostUser").
		Order("is_official desc").
		Order("start_at asc").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *adminRepository) ListReports(ctx context.Context, status string, limit int) ([]model.Report, error) {
	var items []model.Report
	query := r.db.WithContext(ctx).Preload("ReporterUser").Order("created_at desc").Limit(limit)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Find(&items).Error
	return items, err
}

func (r *adminRepository) FindReportByID(ctx context.Context, reportID uint) (*model.Report, error) {
	var item model.Report
	err := r.db.WithContext(ctx).Preload("ReporterUser").First(&item, reportID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *adminRepository) UpdateReportStatus(ctx context.Context, reportID uint, status string) error {
	return r.db.WithContext(ctx).
		Model(&model.Report{}).
		Where("id = ?", reportID).
		Update("status", status).Error
}

func (r *adminRepository) AddCreditRecord(ctx context.Context, record *model.CreditRecord) error {
	return r.db.WithContext(ctx).Create(record).Error
}

func (r *adminRepository) ListMembershipOrders(ctx context.Context, limit int) ([]model.PaymentOrder, error) {
	var items []model.PaymentOrder
	err := r.db.WithContext(ctx).
		Order("created_at desc").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *adminRepository) FindMembershipOrderByID(ctx context.Context, orderID uint) (*model.PaymentOrder, error) {
	var item model.PaymentOrder
	err := r.db.WithContext(ctx).First(&item, orderID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *adminRepository) UpdateMembershipOrderStatus(ctx context.Context, orderID uint, status string) error {
	return r.db.WithContext(ctx).
		Model(&model.PaymentOrder{}).
		Where("id = ?", orderID).
		Update("status", status).Error
}

func (r *adminRepository) CreateAuditLog(ctx context.Context, log *model.AdminAuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *adminRepository) ListAuditLogs(ctx context.Context, limit int) ([]model.AdminAuditLog, error) {
	var items []model.AdminAuditLog
	err := r.db.WithContext(ctx).
		Order("created_at desc").
		Limit(limit).
		Find(&items).Error
	return items, err
}
