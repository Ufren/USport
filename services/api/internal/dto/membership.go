package dto

type MembershipPlanItem struct {
	ID            uint     `json:"id"`
	Code          string   `json:"code"`
	Name          string   `json:"name"`
	PriceLabel    string   `json:"priceLabel"`
	DurationLabel string   `json:"durationLabel"`
	Description   string   `json:"description"`
	Benefits      []string `json:"benefits"`
	IsActive      bool     `json:"isActive"`
}

type SubscriptionSummary struct {
	IsMember               bool   `json:"isMember"`
	PlanCode               string `json:"planCode,omitempty"`
	PlanName               string `json:"planName,omitempty"`
	StatusLabel            string `json:"statusLabel"`
	ExpireAtLabel          string `json:"expireAtLabel,omitempty"`
	ExposureBoost          string `json:"exposureBoost"`
	FilterUnlocks          string `json:"filterUnlocks"`
	RecommendationPriority string `json:"recommendationPriority"`
}

type CreateMembershipOrderRequest struct {
	PlanCode string `json:"planCode" binding:"required"`
}

type MembershipOrderItem struct {
	ID          uint   `json:"id"`
	PlanCode    string `json:"planCode"`
	AmountLabel string `json:"amountLabel"`
	Status      string `json:"status"`
	StatusLabel string `json:"statusLabel"`
	CreatedAt   string `json:"createdAt"`
	CanPay      bool   `json:"canPay"`
	CanRefund   bool   `json:"canRefund"`
}

type MockPayMembershipOrderRequest struct {
	OrderID uint `json:"orderId" binding:"required"`
}
