package service

import (
	"context"
	"testing"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

type fakeMembershipRepository struct {
	plans        []model.MembershipPlan
	subscription *model.Subscription
	orders       []model.PaymentOrder
}

func (r *fakeMembershipRepository) ListPlans(context.Context) ([]model.MembershipPlan, error) {
	return append([]model.MembershipPlan(nil), r.plans...), nil
}

func (r *fakeMembershipRepository) FindPlanByCode(_ context.Context, code string) (*model.MembershipPlan, error) {
	for index := range r.plans {
		if r.plans[index].Code == code {
			plan := r.plans[index]
			return &plan, nil
		}
	}

	return nil, nil
}

func (r *fakeMembershipRepository) FindLatestSubscription(context.Context, uint) (*model.Subscription, error) {
	if r.subscription == nil {
		return nil, nil
	}

	item := *r.subscription
	return &item, nil
}

func (r *fakeMembershipRepository) UpsertSubscription(_ context.Context, subscription *model.Subscription) error {
	copyItem := *subscription
	r.subscription = &copyItem
	return nil
}

func (r *fakeMembershipRepository) CreateOrder(_ context.Context, order *model.PaymentOrder) error {
	order.ID = uint(len(r.orders) + 1)
	r.orders = append(r.orders, *order)
	return nil
}

func (r *fakeMembershipRepository) FindOrderByID(_ context.Context, orderID uint) (*model.PaymentOrder, error) {
	for index := range r.orders {
		if r.orders[index].ID == orderID {
			item := r.orders[index]
			return &item, nil
		}
	}
	return nil, nil
}

func (r *fakeMembershipRepository) UpdateOrderStatus(
	_ context.Context,
	orderID uint,
	status string,
	paidAt *time.Time,
) error {
	for index := range r.orders {
		if r.orders[index].ID != orderID {
			continue
		}
		r.orders[index].Status = status
		if paidAt != nil {
			r.orders[index].PaidAt = *paidAt
		}
		return nil
	}
	return nil
}

func (r *fakeMembershipRepository) ListOrders(context.Context, uint, int) ([]model.PaymentOrder, error) {
	return append([]model.PaymentOrder(nil), r.orders...), nil
}

func (r *fakeMembershipRepository) WithTx(_ context.Context, fn func(repo repository.MembershipRepository) error) error {
	return fn(r)
}

func TestCreateMembershipOrderActivatesSubscription(t *testing.T) {
	repo := &fakeMembershipRepository{
		plans: []model.MembershipPlan{
			{
				ID:           1,
				Code:         "starter_month",
				Name:         "月度会员",
				PriceCents:   1990,
				DurationDays: 30,
				IsActive:     true,
			},
		},
	}

	svc := NewMembershipService(repo)
	item, err := svc.CreateOrder(context.Background(), 7, dto.CreateMembershipOrderRequest{
		PlanCode: "starter_month",
	})
	if err != nil {
		t.Fatalf("CreateOrder returned error: %v", err)
	}

	if item.Status != model.OrderStatusPaid {
		t.Fatalf("expected paid order, got %s", item.Status)
	}

	if repo.subscription == nil {
		t.Fatal("expected subscription to be created")
	}

	if repo.subscription.Status != model.SubscriptionStatusActive {
		t.Fatalf("expected active subscription, got %s", repo.subscription.Status)
	}

	if !repo.subscription.ExpireAt.After(repo.subscription.StartAt) {
		t.Fatal("expected subscription expire time after start time")
	}
}

func TestGetMembershipSummaryReturnsMemberState(t *testing.T) {
	repo := &fakeMembershipRepository{
		plans: []model.MembershipPlan{
			{
				ID:           1,
				Code:         "season_pass",
				Name:         "季度会员",
				PriceCents:   4990,
				DurationDays: 90,
				IsActive:     true,
			},
		},
		subscription: &model.Subscription{
			UserID:   7,
			PlanCode: "season_pass",
			Status:   model.SubscriptionStatusActive,
			StartAt:  time.Now().Add(-24 * time.Hour),
			ExpireAt: time.Now().Add(24 * time.Hour),
		},
	}

	svc := NewMembershipService(repo)
	item, err := svc.GetSummary(context.Background(), 7)
	if err != nil {
		t.Fatalf("GetSummary returned error: %v", err)
	}

	if !item.IsMember {
		t.Fatal("expected member summary to be active")
	}

	if item.PlanCode != "season_pass" {
		t.Fatalf("expected season_pass, got %s", item.PlanCode)
	}
}
