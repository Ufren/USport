package dto

type CreateActivityRequest struct {
	SportCode        string `json:"sportCode" binding:"required"`
	Title            string `json:"title" binding:"required"`
	Description      string `json:"description"`
	Date             string `json:"date" binding:"required"`
	StartTime        string `json:"startTime" binding:"required"`
	EndTime          string `json:"endTime" binding:"required"`
	DeadlineTime     string `json:"deadlineTime" binding:"required"`
	District         string `json:"district" binding:"required"`
	VenueName        string `json:"venueName" binding:"required"`
	Capacity         int    `json:"capacity" binding:"required"`
	WaitlistCapacity int    `json:"waitlistCapacity"`
	FeeType          string `json:"feeType" binding:"required"`
	FeeAmount        string `json:"feeAmount"`
	JoinRule         string `json:"joinRule" binding:"required"`
	Visibility       string `json:"visibility" binding:"required"`
}

type ActivityFeedItem struct {
	ID                 uint     `json:"id"`
	IsOfficial         bool     `json:"isOfficial"`
	Title              string   `json:"title"`
	Subtitle           string   `json:"subtitle"`
	SportCode          string   `json:"sportCode"`
	SportLabel         string   `json:"sportLabel"`
	District           string   `json:"district"`
	VenueName          string   `json:"venueName"`
	StartTimeLabel     string   `json:"startTimeLabel"`
	FeeLabel           string   `json:"feeLabel"`
	ParticipantSummary string   `json:"participantSummary"`
	AttendanceLabel    string   `json:"attendanceLabel"`
	HostName           string   `json:"hostName"`
	HostBadge          string   `json:"hostBadge"`
	Status             string   `json:"status"`
	Tags               []string `json:"tags"`
	ActionLabel        string   `json:"actionLabel"`
}

type ActivityStatusTone struct {
	Label string `json:"label"`
	Tone  string `json:"tone"`
}

type ActivityHost struct {
	Name                string `json:"name"`
	Badge               string `json:"badge"`
	AttendanceLabel     string `json:"attendanceLabel"`
	RecentSessionsLabel string `json:"recentSessionsLabel"`
}

type ActivityDetail struct {
	ID                  string             `json:"id"`
	SourceActivityID    uint               `json:"sourceActivityId"`
	IsOfficial          bool               `json:"isOfficial"`
	Title               string             `json:"title"`
	SportCode           string             `json:"sportCode"`
	SportLabel          string             `json:"sportLabel"`
	Status              string             `json:"status"`
	StatusTone          ActivityStatusTone `json:"statusTone"`
	RiskHint            string             `json:"riskHint"`
	CoverLabel          string             `json:"coverLabel"`
	Subtitle            string             `json:"subtitle"`
	StartTimeLabel      string             `json:"startTimeLabel"`
	EndTimeLabel        string             `json:"endTimeLabel"`
	SignupDeadlineLabel string             `json:"signupDeadlineLabel"`
	District            string             `json:"district"`
	VenueName           string             `json:"venueName"`
	AddressHint         string             `json:"addressHint"`
	ParticipantSummary  string             `json:"participantSummary"`
	FeeLabel            string             `json:"feeLabel"`
	Host                ActivityHost       `json:"host"`
	Description         string             `json:"description"`
	SuitableCrowd       []string           `json:"suitableCrowd"`
	SkillLevelLabel     string             `json:"skillLevelLabel"`
	GenderRuleLabel     string             `json:"genderRuleLabel"`
	Notices             []string           `json:"notices"`
	AllowWaitlist       bool               `json:"allowWaitlist"`
	ShareSummary        string             `json:"shareSummary"`
}

type RegisterActivityResult struct {
	Status             string `json:"status"`
	ParticipantSummary string `json:"participantSummary"`
}

type MyActivityRole string

const (
	MyActivityRoleHost        MyActivityRole = "host"
	MyActivityRoleParticipant MyActivityRole = "participant"
)

type MyActivityItem struct {
	ActivityFeedItem
	Role               MyActivityRole `json:"role"`
	RegistrationStatus string         `json:"registrationStatus,omitempty"`
	CanCancel          bool           `json:"canCancel"`
	CanManage          bool           `json:"canManage"`
	CanCheckIn         bool           `json:"canCheckIn"`
	CanFinish          bool           `json:"canFinish"`
}
