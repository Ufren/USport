package model

import "time"

const (
	UserStatusActive  = 1
	UserStatusBlocked = 0
)

const (
	ActivityStatusPublished    = "published"
	ActivityStatusFull         = "full"
	ActivityStatusSignupClosed = "signup_closed"
	ActivityStatusOngoing      = "ongoing"
	ActivityStatusCompleted    = "completed"
	ActivityStatusCancelled    = "cancelled"
)

const (
	ParticipantStatusRegistered = "registered"
	ParticipantStatusWaitlisted = "waitlisted"
	ParticipantStatusCheckedIn  = "checked_in"
	ParticipantStatusFinished   = "finished"
	ParticipantStatusCancelled  = "cancelled"
)

const (
	InvitationStatusPending  = "pending"
	InvitationStatusAccepted = "accepted"
	InvitationStatusDeclined = "declined"
	InvitationStatusExpired  = "expired"
)

const (
	ReportStatusOpen            = "open"
	ReportStatusInReview        = "in_review"
	ReportStatusResolvedValid   = "resolved_valid"
	ReportStatusResolvedInvalid = "resolved_invalid"
	ReportStatusClosed          = "closed"
)

const (
	CreditEventAttendanceStable = "attendance_stable"
	CreditEventLateCancel       = "late_cancel"
	CreditEventNoShow           = "no_show"
	CreditEventReportValid      = "report_valid"
)

const (
	OrderStatusPending  = "pending"
	OrderStatusPaid     = "paid"
	OrderStatusClosed   = "closed"
	OrderStatusRefunded = "refunded"
	OrderStatusFailed   = "failed"
)

const (
	SubscriptionStatusActive  = "active"
	SubscriptionStatusExpired = "expired"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Openid    string    `json:"openid" gorm:"size:100;uniqueIndex"`
	Unionid   string    `json:"unionid" gorm:"size:100;index"`
	Phone     string    `json:"phone" gorm:"size:20;index"`
	Nickname  string    `json:"nickname" gorm:"size:50"`
	Avatar    string    `json:"avatar" gorm:"size:255"`
	Status    int       `json:"status" gorm:"not null;default:1"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (User) TableName() string {
	return "users"
}

type Activity struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	HostUserID       uint      `json:"hostUserId" gorm:"index;not null"`
	HostUser         User      `json:"hostUser" gorm:"foreignKey:HostUserID"`
	IsOfficial       bool      `json:"isOfficial" gorm:"not null;default:false"`
	Title            string    `json:"title" gorm:"size:120;not null"`
	Description      string    `json:"description" gorm:"type:text"`
	SportCode        string    `json:"sportCode" gorm:"size:32;index;not null"`
	SportLabel       string    `json:"sportLabel" gorm:"size:32;not null"`
	District         string    `json:"district" gorm:"size:64;index;not null"`
	VenueName        string    `json:"venueName" gorm:"size:120;not null"`
	AddressHint      string    `json:"addressHint" gorm:"size:255"`
	StartAt          time.Time `json:"startAt" gorm:"index;not null"`
	EndAt            time.Time `json:"endAt" gorm:"not null"`
	SignupDeadlineAt time.Time `json:"signupDeadlineAt" gorm:"index;not null"`
	Capacity         int       `json:"capacity" gorm:"not null"`
	WaitlistCapacity int       `json:"waitlistCapacity" gorm:"not null;default:0"`
	FeeType          string    `json:"feeType" gorm:"size:32;not null"`
	FeeAmount        float64   `json:"feeAmount" gorm:"type:decimal(10,2);not null;default:0"`
	JoinRule         string    `json:"joinRule" gorm:"size:32;not null"`
	Visibility       string    `json:"visibility" gorm:"size:32;not null"`
	Status           string    `json:"status" gorm:"size:32;index;not null;default:'published'"`
	SuitableCrowd    []string  `json:"suitableCrowd" gorm:"serializer:json"`
	Notices          []string  `json:"notices" gorm:"serializer:json"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Activity) TableName() string {
	return "activities"
}

type ActivityParticipant struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	ActivityID uint      `json:"activityId" gorm:"uniqueIndex:idx_activity_user;index;not null"`
	UserID     uint      `json:"userId" gorm:"uniqueIndex:idx_activity_user;index;not null"`
	Status     string    `json:"status" gorm:"size:32;index;not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (ActivityParticipant) TableName() string {
	return "activity_participants"
}

type Invitation struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ActivityID     uint      `json:"activityId" gorm:"index;not null"`
	Activity       Activity  `json:"activity" gorm:"foreignKey:ActivityID"`
	SenderUserID   uint      `json:"senderUserId" gorm:"index;not null"`
	SenderUser     User      `json:"senderUser" gorm:"foreignKey:SenderUserID"`
	ReceiverUserID uint      `json:"receiverUserId" gorm:"index;not null"`
	ReceiverUser   User      `json:"receiverUser" gorm:"foreignKey:ReceiverUserID"`
	Message        string    `json:"message" gorm:"size:255"`
	Status         string    `json:"status" gorm:"size:32;index;not null;default:'pending'"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Invitation) TableName() string {
	return "invitations"
}

type Report struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ReporterUserID uint      `json:"reporterUserId" gorm:"index;not null"`
	ReporterUser   User      `json:"reporterUser" gorm:"foreignKey:ReporterUserID"`
	TargetType     string    `json:"targetType" gorm:"size:32;index;not null"`
	TargetID       uint      `json:"targetId" gorm:"index;not null"`
	ReasonCode     string    `json:"reasonCode" gorm:"size:64;not null"`
	Description    string    `json:"description" gorm:"size:500"`
	Status         string    `json:"status" gorm:"size:32;index;not null;default:'open'"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Report) TableName() string {
	return "reports"
}

type CreditRecord struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"userId" gorm:"index;not null"`
	User        User      `json:"user" gorm:"foreignKey:UserID"`
	EventCode   string    `json:"eventCode" gorm:"size:64;index;not null"`
	Delta       int       `json:"delta" gorm:"not null"`
	Description string    `json:"description" gorm:"size:255"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (CreditRecord) TableName() string {
	return "credit_records"
}

type MembershipPlan struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Code         string    `json:"code" gorm:"size:32;uniqueIndex;not null"`
	Name         string    `json:"name" gorm:"size:64;not null"`
	PriceCents   int       `json:"priceCents" gorm:"not null"`
	DurationDays int       `json:"durationDays" gorm:"not null"`
	Description  string    `json:"description" gorm:"size:255"`
	Benefits     []string  `json:"benefits" gorm:"serializer:json"`
	IsActive     bool      `json:"isActive" gorm:"not null;default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (MembershipPlan) TableName() string {
	return "membership_plans"
}

type Subscription struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"userId" gorm:"index;not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	PlanCode  string    `json:"planCode" gorm:"size:32;index;not null"`
	Status    string    `json:"status" gorm:"size:32;index;not null"`
	StartAt   time.Time `json:"startAt"`
	ExpireAt  time.Time `json:"expireAt"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Subscription) TableName() string {
	return "subscriptions"
}

type PaymentOrder struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"userId" gorm:"index;not null"`
	User        User      `json:"user" gorm:"foreignKey:UserID"`
	PlanCode    string    `json:"planCode" gorm:"size:32;index;not null"`
	AmountCents int       `json:"amountCents" gorm:"not null"`
	Status      string    `json:"status" gorm:"size:32;index;not null"`
	PaidAt      time.Time `json:"paidAt"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (PaymentOrder) TableName() string {
	return "payment_orders"
}

type AdminAuditLog struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Operator   string    `json:"operator" gorm:"size:64;not null"`
	ActionCode string    `json:"actionCode" gorm:"size:64;index;not null"`
	TargetType string    `json:"targetType" gorm:"size:32;index;not null"`
	TargetID   uint      `json:"targetId" gorm:"index;not null"`
	Detail     string    `json:"detail" gorm:"size:500"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (AdminAuditLog) TableName() string {
	return "admin_audit_logs"
}
