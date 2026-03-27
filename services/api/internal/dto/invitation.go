package dto

type InvitationItem struct {
	ID              uint   `json:"id"`
	ActivityID      uint   `json:"activityId"`
	ActivityTitle   string `json:"activityTitle"`
	ActivityTime    string `json:"activityTime"`
	VenueLabel      string `json:"venueLabel"`
	SenderName      string `json:"senderName"`
	SenderBadge     string `json:"senderBadge"`
	Message         string `json:"message"`
	Status          string `json:"status"`
	StatusLabel     string `json:"statusLabel"`
	CreatedAtLabel  string `json:"createdAtLabel"`
	CanAccept       bool   `json:"canAccept"`
	CanDecline      bool   `json:"canDecline"`
	ParticipantHint string `json:"participantHint"`
}

type RespondInvitationRequest struct {
	Action string `json:"action" binding:"required"`
}

type InboxWorkspace struct {
	PendingCount  int              `json:"pendingCount"`
	UnreadCount   int              `json:"unreadCount"`
	TotalMessages int              `json:"totalMessages"`
	Invitations   []InvitationItem `json:"invitations"`
	Messages      []MessagePreview `json:"messages"`
}

type MessagePreview struct {
	ID             uint   `json:"id"`
	Title          string `json:"title"`
	Preview        string `json:"preview"`
	TimestampLabel string `json:"timestampLabel"`
	UnreadCount    int    `json:"unreadCount"`
}
