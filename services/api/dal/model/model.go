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
	ParticipantStatusCancelled  = "cancelled"
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
