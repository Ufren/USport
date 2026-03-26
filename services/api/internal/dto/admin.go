package dto

type AdminDashboardSummary struct {
	UsersTotal          int64 `json:"usersTotal"`
	PublishedActivities int64 `json:"publishedActivities"`
	OpenReports         int64 `json:"openReports"`
	InReviewReports     int64 `json:"inReviewReports"`
	PaidOrders          int64 `json:"paidOrders"`
	ActiveMembers       int64 `json:"activeMembers"`
}

type AdminReportItem struct {
	ID             uint   `json:"id"`
	ReporterUserID uint   `json:"reporterUserId"`
	ReporterName   string `json:"reporterName"`
	TargetType     string `json:"targetType"`
	TargetID       uint   `json:"targetId"`
	ReasonCode     string `json:"reasonCode"`
	Description    string `json:"description"`
	Status         string `json:"status"`
	StatusLabel    string `json:"statusLabel"`
	CreatedAtLabel string `json:"createdAtLabel"`
	CanResolve     bool   `json:"canResolve"`
	CanEscalate    bool   `json:"canEscalate"`
}

type AdminReportDecisionRequest struct {
	Decision string `json:"decision" binding:"required"`
	Note     string `json:"note"`
}

type AdminMembershipOrderItem struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"userId"`
	PlanCode    string `json:"planCode"`
	AmountLabel string `json:"amountLabel"`
	Status      string `json:"status"`
	StatusLabel string `json:"statusLabel"`
	CreatedAt   string `json:"createdAt"`
}

type AdminAuditLogItem struct {
	ID         uint   `json:"id"`
	Operator   string `json:"operator"`
	ActionCode string `json:"actionCode"`
	TargetType string `json:"targetType"`
	TargetID   uint   `json:"targetId"`
	Detail     string `json:"detail"`
	CreatedAt  string `json:"createdAt"`
}

type AdminOfficialActivityItem struct {
	ID              uint   `json:"id"`
	Title           string `json:"title"`
	SportLabel      string `json:"sportLabel"`
	StartTimeLabel  string `json:"startTimeLabel"`
	VenueName       string `json:"venueName"`
	District        string `json:"district"`
	ParticipantHint string `json:"participantHint"`
}
