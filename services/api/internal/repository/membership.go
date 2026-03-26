package repository

import (
	"context"
	"errors"
	"time"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
)

type MembershipRepository interface {
	ListPlans(ctx context.Context) ([]model.MembershipPlan, error)
	FindPlanByCode(ctx context.Context, code string) (*model.MembershipPlan, error)
	FindLatestSubscription(ctx context.Context, userID uint) (*model.Subscription, error)
	UpsertSubscription(ctx context.Context, subscription *model.Subscription) error
	CreateOrder(ctx context.Context, order *model.PaymentOrder) error
	FindOrderByID(ctx context.Context, orderID uint) (*model.PaymentOrder, error)
	UpdateOrderStatus(ctx context.Context, orderID uint, status string, paidAt *time.Time) error
	ListOrders(ctx context.Context, userID uint, limit int) ([]model.PaymentOrder, error)
	WithTx(ctx context.Context, fn func(repo MembershipRepository) error) error
}

type membershipRepository struct {
	db *gorm.DB
}

func NewMembershipRepository(db *gorm.DB) MembershipRepository {
	return &membershipRepository{db: db}
}

func (r *membershipRepository) ListPlans(ctx context.Context) ([]model.MembershipPlan, error) {
	var items []model.MembershipPlan
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("price_cents asc").
		Find(&items).Error
	return items, err
}

func (r *membershipRepository) FindPlanByCode(ctx context.Context, code string) (*model.MembershipPlan, error) {
	var item model.MembershipPlan
	err := r.db.WithContext(ctx).Where("code = ?", code).First(&item).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *membershipRepository) FindLatestSubscription(ctx context.Context, userID uint) (*model.Subscription, error) {
	var item model.Subscription
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("updated_at desc").
		First(&item).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *membershipRepository) UpsertSubscription(ctx context.Context, subscription *model.Subscription) error {
	current, err := r.FindLatestSubscription(ctx, subscription.UserID)
	if err != nil {
		return err
	}
	if current == nil {
		return r.db.WithContext(ctx).Create(subscription).Error
	}

	return r.db.WithContext(ctx).
		Model(&model.Subscription{}).
		Where("id = ?", current.ID).
		Updates(map[string]any{
			"plan_code": subscription.PlanCode,
			"status":    subscription.Status,
			"start_at":  subscription.StartAt,
			"expire_at": subscription.ExpireAt,
		}).Error
}

func (r *membershipRepository) CreateOrder(ctx context.Context, order *model.PaymentOrder) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *membershipRepository) FindOrderByID(ctx context.Context, orderID uint) (*model.PaymentOrder, error) {
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

func (r *membershipRepository) UpdateOrderStatus(
	ctx context.Context,
	orderID uint,
	status string,
	paidAt *time.Time,
) error {
	updates := map[string]any{"status": status}
	if paidAt != nil {
		updates["paid_at"] = *paidAt
	}
	return r.db.WithContext(ctx).
		Model(&model.PaymentOrder{}).
		Where("id = ?", orderID).
		Updates(updates).Error
}

func (r *membershipRepository) ListOrders(ctx context.Context, userID uint, limit int) ([]model.PaymentOrder, error) {
	var items []model.PaymentOrder
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at desc").
		Limit(limit).
		Find(&items).Error
	return items, err
}

func (r *membershipRepository) WithTx(ctx context.Context, fn func(repo MembershipRepository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(&membershipRepository{db: tx})
	})
}
