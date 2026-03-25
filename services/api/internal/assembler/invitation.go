package assembler

import (
	"fmt"
	"strings"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
)

func ToInvitationItem(invitation model.Invitation) dto.InvitationItem {
	statusLabel := mapInvitationStatusLabel(invitation.Status)
	canRespond := invitation.Status == model.InvitationStatusPending

	return dto.InvitationItem{
		ID:             invitation.ID,
		ActivityID:     invitation.ActivityID,
		ActivityTitle:  invitation.Activity.Title,
		ActivityTime:   invitation.Activity.StartAt.Format("01月02日 15:04"),
		VenueLabel:     fmt.Sprintf("%s · %s", invitation.Activity.District, invitation.Activity.VenueName),
		SenderName:     fallbackUserName(invitation.SenderUser),
		SenderBadge:    buildHostBadge(invitation.SenderUser.Nickname),
		Message:        firstNonEmpty(strings.TrimSpace(invitation.Message), "这场局我觉得你会很适合，来一起打吧。"),
		Status:         invitation.Status,
		StatusLabel:    statusLabel,
		CreatedAtLabel: invitation.CreatedAt.Format("01月02日 15:04"),
		CanAccept:      canRespond,
		CanDecline:     canRespond,
		ParticipantHint: fmt.Sprintf(
			"%s · %s",
			formatFeeLabel(invitation.Activity.FeeType, invitation.Activity.FeeAmount),
			invitation.Activity.SportLabel,
		),
	}
}

func ToInvitationMessagePreview(invitation model.Invitation) dto.MessagePreview {
	title := fmt.Sprintf("%s 邀请你加入活动", fallbackUserName(invitation.SenderUser))
	preview := fmt.Sprintf("%s · %s", invitation.Activity.Title, mapInvitationStatusMessage(invitation.Status))

	return dto.MessagePreview{
		ID:             invitation.ID,
		Title:          title,
		Preview:        preview,
		TimestampLabel: invitation.CreatedAt.Format("01月02日 15:04"),
		UnreadCount:    invitationUnreadCount(invitation.Status),
	}
}

func mapInvitationStatusLabel(status string) string {
	switch status {
	case model.InvitationStatusAccepted:
		return "已接受"
	case model.InvitationStatusDeclined:
		return "已婉拒"
	case model.InvitationStatusExpired:
		return "已过期"
	default:
		return "待处理"
	}
}

func mapInvitationStatusMessage(status string) string {
	switch status {
	case model.InvitationStatusAccepted:
		return "你已接受邀约"
	case model.InvitationStatusDeclined:
		return "你已拒绝邀约"
	case model.InvitationStatusExpired:
		return "邀约已过期"
	default:
		return "等待你的回应"
	}
}

func invitationUnreadCount(status string) int {
	if status == model.InvitationStatusPending {
		return 1
	}
	return 0
}
