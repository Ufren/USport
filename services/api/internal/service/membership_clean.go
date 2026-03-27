package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

var (
	ErrMembershipPlanInvalid  = errors.New("会员套餐不存在或暂不可购买")
	ErrMembershipOrderInvalid = errors.New("会员订单不存在")
	ErrMembershipOrderPaid    = errors.New("会员订单已支付")
	ErrMembershipOrderClosed  = errors.New("会员订单当前状态不支持此操作")
)

type MembershipService interface {
	ListPlans(ctx context.Context) ([]dto.MembershipPlanItem, error)
	GetSummary(ctx context.Context, userID uint) (*dto.SubscriptionSummary, error)
	CreateOrder(ctx context.Context, userID uint, req dto.CreateMembershipOrderRequest) (*dto.MembershipOrderItem, error)
	MockPayOrder(ctx context.Context, userID uint, orderID uint) (*dto.MembershipOrderItem, error)
	ListOrders(ctx context.Context, userID uint) ([]dto.MembershipOrderItem, error)
}

type membershipService struct {
	membershipRepo repository.MembershipRepository
}

func NewMembershipService(membershipRepo repository.MembershipRepository) MembershipService {
	return &membershipService{membershipRepo: membershipRepo}
}

func (s *membershipService) ListPlans(ctx context.Context) ([]dto.MembershipPlanItem, error) {
	items, err := s.membershipRepo.ListPlans(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]dto.MembershipPlanItem, 0, len(items))
	for _, item := range items {
		result = append(result, toMembershipPlanItem(item))
	}

	return result, nil
}

func (s *membershipService) GetSummary(ctx context.Context, userID uint) (*dto.SubscriptionSummary, error) {
	plans, err := s.membershipRepo.ListPlans(ctx)
	if err != nil {
		return nil, err
	}

	subscription, err := s.membershipRepo.FindLatestSubscription(ctx, userID)
	if err != nil {
		return nil, err
	}

	var plan *model.MembershipPlan
	if subscription != nil {
		for index := range plans {
			if plans[index].Code == subscription.PlanCode {
				plan = &plans[index]
				break
			}
		}
	}

	result := buildSubscriptionSummary(plan, subscription, time.Now())
	return &result, nil
}

func (s *membershipService) CreateOrder(
	ctx context.Context,
	userID uint,
	req dto.CreateMembershipOrderRequest,
) (*dto.MembershipOrderItem, error) {
	planCode := strings.TrimSpace(req.PlanCode)
	if userID == 0 || planCode == "" {
		return nil, ErrMembershipPlanInvalid
	}

	plan, err := s.membershipRepo.FindPlanByCode(ctx, planCode)
	if err != nil {
		return nil, err
	}
	if plan == nil || !plan.IsActive {
		return nil, ErrMembershipPlanInvalid
	}

	order := &model.PaymentOrder{
		UserID:      userID,
		PlanCode:    plan.Code,
		AmountCents: plan.PriceCents,
		Status:      model.OrderStatusPending,
	}
	if err := s.membershipRepo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	result := toMembershipOrderItem(*order)
	return &result, nil
}

func (s *membershipService) MockPayOrder(
	ctx context.Context,
	userID uint,
	orderID uint,
) (*dto.MembershipOrderItem, error) {
	if userID == 0 || orderID == 0 {
		return nil, ErrMembershipOrderInvalid
	}

	var result dto.MembershipOrderItem
	err := s.membershipRepo.WithTx(ctx, func(repo repository.MembershipRepository) error {
		order, err := repo.FindOrderByID(ctx, orderID)
		if err != nil {
			return err
		}
		if order == nil || order.UserID != userID {
			return ErrMembershipOrderInvalid
		}
		if order.Status == model.OrderStatusPaid {
			return ErrMembershipOrderPaid
		}
		if order.Status != model.OrderStatusPending {
			return ErrMembershipOrderClosed
		}

		plan, err := repo.FindPlanByCode(ctx, order.PlanCode)
		if err != nil {
			return err
		}
		if plan == nil || !plan.IsActive {
			return ErrMembershipPlanInvalid
		}

		now := time.Now()
		if err := repo.UpdateOrderStatus(ctx, order.ID, model.OrderStatusPaid, &now); err != nil {
			return err
		}

		order.Status = model.OrderStatusPaid
		order.PaidAt = now

		// 支付成功后再激活订阅，避免“下单即生效”的状态穿透问题。
		if err := activateSubscription(ctx, repo, userID, *plan, now); err != nil {
			return err
		}

		result = toMembershipOrderItem(*order)
		return nil
	})
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *membershipService) ListOrders(ctx context.Context, userID uint) ([]dto.MembershipOrderItem, error) {
	items, err := s.membershipRepo.ListOrders(ctx, userID, 20)
	if err != nil {
		return nil, err
	}

	result := make([]dto.MembershipOrderItem, 0, len(items))
	for _, item := range items {
		result = append(result, toMembershipOrderItem(item))
	}

	return result, nil
}

func activateSubscription(
	ctx context.Context,
	repo repository.MembershipRepository,
	userID uint,
	plan model.MembershipPlan,
	now time.Time,
) error {
	startAt := now
	current, err := repo.FindLatestSubscription(ctx, userID)
	if err != nil {
		return err
	}
	if current != nil && current.Status == model.SubscriptionStatusActive && current.ExpireAt.After(now) {
		startAt = current.ExpireAt
	}

	subscription := &model.Subscription{
		UserID:   userID,
		PlanCode: plan.Code,
		Status:   model.SubscriptionStatusActive,
		StartAt:  startAt,
		ExpireAt: startAt.AddDate(0, 0, plan.DurationDays),
	}

	return repo.UpsertSubscription(ctx, subscription)
}

func toMembershipPlanItem(plan model.MembershipPlan) dto.MembershipPlanItem {
	return dto.MembershipPlanItem{
		ID:            plan.ID,
		Code:          plan.Code,
		Name:          plan.Name,
		PriceLabel:    fmt.Sprintf("¥%.2f / %d 天", float64(plan.PriceCents)/100, plan.DurationDays),
		DurationLabel: fmt.Sprintf("%d 天有效期", plan.DurationDays),
		Description:   plan.Description,
		Benefits:      append([]string(nil), plan.Benefits...),
		IsActive:      plan.IsActive,
	}
}

func buildSubscriptionSummary(
	plan *model.MembershipPlan,
	subscription *model.Subscription,
	now time.Time,
) dto.SubscriptionSummary {
	if plan == nil || subscription == nil {
		return dto.SubscriptionSummary{
			IsMember:               false,
			StatusLabel:            "未开通会员",
			ExposureBoost:          "基础曝光",
			FilterUnlocks:          "标准筛选",
			RecommendationPriority: "普通优先级",
		}
	}

	isActive := subscription.Status == model.SubscriptionStatusActive && subscription.ExpireAt.After(now)
	statusLabel := "已过期"
	if isActive {
		statusLabel = "会员有效中"
	}

	return dto.SubscriptionSummary{
		IsMember:               isActive,
		PlanCode:               plan.Code,
		PlanName:               plan.Name,
		StatusLabel:            statusLabel,
		ExpireAtLabel:          subscription.ExpireAt.Format("2006-01-02 15:04"),
		ExposureBoost:          "活动曝光提升 2 倍",
		FilterUnlocks:          "解锁距离、时间段、履约筛选",
		RecommendationPriority: "同城推荐优先展示",
	}
}

func toMembershipOrderItem(order model.PaymentOrder) dto.MembershipOrderItem {
	return dto.MembershipOrderItem{
		ID:          order.ID,
		PlanCode:    order.PlanCode,
		AmountLabel: fmt.Sprintf("¥%.2f", float64(order.AmountCents)/100),
		Status:      order.Status,
		StatusLabel: mapMembershipOrderStatus(order.Status),
		CreatedAt:   order.CreatedAt.Format("2006-01-02 15:04"),
		CanPay:      order.Status == model.OrderStatusPending,
		CanRefund:   order.Status == model.OrderStatusPaid,
	}
}

func mapMembershipOrderStatus(status string) string {
	switch status {
	case model.OrderStatusPaid:
		return "已支付"
	case model.OrderStatusRefunded:
		return "已退款"
	case model.OrderStatusFailed:
		return "支付失败"
	case model.OrderStatusClosed:
		return "已关闭"
	default:
		return "待支付"
	}
}
