package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/assembler"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

var (
	ErrMembershipPlanInvalid = errors.New("会员套餐不存在或暂不可购买")
)

type MembershipService interface {
	ListPlans(ctx context.Context) ([]dto.MembershipPlanItem, error)
	GetSummary(ctx context.Context, userID uint) (*dto.SubscriptionSummary, error)
	CreateOrder(ctx context.Context, userID uint, req dto.CreateMembershipOrderRequest) (*dto.MembershipOrderItem, error)
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
		result = append(result, assembler.ToMembershipPlanItem(item))
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

	result := assembler.BuildSubscriptionSummary(plan, subscription, time.Now())
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

	now := time.Now()
	order := &model.PaymentOrder{
		UserID:      userID,
		PlanCode:    plan.Code,
		AmountCents: plan.PriceCents,
		Status:      model.OrderStatusPaid,
	}
	if err := s.membershipRepo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	startAt := now
	current, err := s.membershipRepo.FindLatestSubscription(ctx, userID)
	if err != nil {
		return nil, err
	}
	if current != nil && current.Status == model.SubscriptionStatusActive && current.ExpireAt.After(now) {
		startAt = current.ExpireAt
	}

	subscription := &model.Subscription{
		UserID:   userID,
		PlanCode: plan.Code,
		Status:   model.SubscriptionStatusActive,
		StartAt:  now,
		ExpireAt: startAt.AddDate(0, 0, plan.DurationDays),
	}
	if err := s.membershipRepo.UpsertSubscription(ctx, subscription); err != nil {
		return nil, err
	}

	result := assembler.ToMembershipOrderItem(*order)
	return &result, nil
}

func (s *membershipService) ListOrders(ctx context.Context, userID uint) ([]dto.MembershipOrderItem, error) {
	items, err := s.membershipRepo.ListOrders(ctx, userID, 20)
	if err != nil {
		return nil, err
	}

	result := make([]dto.MembershipOrderItem, 0, len(items))
	for _, item := range items {
		result = append(result, assembler.ToMembershipOrderItem(item))
	}

	return result, nil
}
