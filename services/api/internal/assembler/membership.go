package assembler

import (
	"fmt"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
)

func ToMembershipPlanItem(plan model.MembershipPlan) dto.MembershipPlanItem {
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

func BuildSubscriptionSummary(
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
		FilterUnlocks:          "解锁距离、时段、履约筛选",
		RecommendationPriority: "同城推荐优先展示",
	}
}

func ToMembershipOrderItem(order model.PaymentOrder) dto.MembershipOrderItem {
	return dto.MembershipOrderItem{
		ID:          order.ID,
		PlanCode:    order.PlanCode,
		AmountLabel: fmt.Sprintf("¥%.2f", float64(order.AmountCents)/100),
		Status:      order.Status,
		StatusLabel: mapOrderStatusLabel(order.Status),
		CreatedAt:   order.CreatedAt.Format("2006-01-02 15:04"),
		CanPay:      order.Status == model.OrderStatusPending,
		CanRefund:   order.Status == model.OrderStatusPaid,
	}
}

func mapOrderStatusLabel(status string) string {
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
