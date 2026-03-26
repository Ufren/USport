package dto

type CreateReportRequest struct {
	TargetType  string `json:"targetType" binding:"required"`
	TargetID    uint   `json:"targetId" binding:"required"`
	ReasonCode  string `json:"reasonCode" binding:"required"`
	Description string `json:"description"`
}

type ReportItem struct {
	ID             uint   `json:"id"`
	TargetType     string `json:"targetType"`
	TargetID       uint   `json:"targetId"`
	ReasonCode     string `json:"reasonCode"`
	Description    string `json:"description"`
	Status         string `json:"status"`
	StatusLabel    string `json:"statusLabel"`
	CreatedAtLabel string `json:"createdAtLabel"`
}

type CreditSummary struct {
	Score                 int          `json:"score"`
	LevelLabel            string       `json:"levelLabel"`
	PositiveCount         int          `json:"positiveCount"`
	RiskCount             int          `json:"riskCount"`
	CompletionRate        string       `json:"completionRate"`
	RecentRecords         []CreditItem `json:"recentRecords"`
	ImprovementSuggestion string       `json:"improvementSuggestion"`
}

type CreditItem struct {
	ID          uint   `json:"id"`
	EventCode   string `json:"eventCode"`
	Delta       int    `json:"delta"`
	Label       string `json:"label"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
}
