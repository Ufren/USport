package assembler

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

func ToActivityFeedItem(activity model.Activity, count repository.ParticipantCounters) dto.ActivityFeedItem {
	status := deriveActivityStatus(activity, count)

	return dto.ActivityFeedItem{
		ID:                 activity.ID,
		Title:              activity.Title,
		Subtitle:           buildSubtitle(activity),
		SportCode:          activity.SportCode,
		SportLabel:         activity.SportLabel,
		District:           "上海·" + activity.District,
		VenueName:          activity.VenueName,
		StartTimeLabel:     activity.StartAt.Format("01月02日 15:04") + " - " + activity.EndAt.Format("15:04"),
		FeeLabel:           formatFeeLabel(activity.FeeType, activity.FeeAmount),
		ParticipantSummary: formatParticipantSummary(activity.Capacity, activity.WaitlistCapacity, count),
		AttendanceLabel:    buildAttendanceLabel(activity.HostUser.Nickname),
		HostName:           fallbackUserName(activity.HostUser),
		HostBadge:          buildHostBadge(activity.HostUser.Nickname),
		Status:             status,
		Tags:               buildActivityTags(activity, status),
		ActionLabel:        buildActionLabel(status, activity.WaitlistCapacity > 0),
	}
}

func ToActivityDetail(activity model.Activity, count repository.ParticipantCounters) dto.ActivityDetail {
	status := deriveActivityStatus(activity, count)
	statusTone := mapStatusTone(status)

	suitableCrowd := append([]string{}, activity.SuitableCrowd...)
	if len(suitableCrowd) == 0 {
		suitableCrowd = []string{"单人可报", "同城成局", "真实到场"}
	}

	notices := append([]string{}, activity.Notices...)
	if len(notices) == 0 {
		notices = []string{
			"建议提前 15 分钟到场，方便热身与集合。",
			"活动开始前如有变动，请尽快在消息页同步。",
		}
	}

	return dto.ActivityDetail{
		ID:                  strconv.FormatUint(uint64(activity.ID), 10),
		SourceActivityID:    activity.ID,
		Title:               activity.Title,
		SportCode:           activity.SportCode,
		SportLabel:          activity.SportLabel,
		Status:              status,
		StatusTone:          statusTone,
		RiskHint:            buildRiskHint(status, activity.WaitlistCapacity > 0),
		CoverLabel:          fmt.Sprintf("%s · %s", activity.District, activity.SportLabel),
		Subtitle:            buildSubtitle(activity),
		StartTimeLabel:      activity.StartAt.Format("01月02日 15:04"),
		EndTimeLabel:        activity.EndAt.Format("01月02日 15:04"),
		SignupDeadlineLabel: activity.SignupDeadlineAt.Format("01月02日 15:04 截止"),
		District:            "上海 · " + activity.District,
		VenueName:           activity.VenueName,
		AddressHint:         firstNonEmpty(activity.AddressHint, "集合点信息将在报名后进一步同步。"),
		ParticipantSummary:  formatParticipantSummary(activity.Capacity, activity.WaitlistCapacity, count),
		FeeLabel:            formatFeeLabel(activity.FeeType, activity.FeeAmount),
		Host: dto.ActivityHost{
			Name:                fallbackUserName(activity.HostUser),
			Badge:               buildHostBadge(activity.HostUser.Nickname),
			AttendanceLabel:     buildAttendanceLabel(activity.HostUser.Nickname),
			RecentSessionsLabel: "连续成局中，优先面向高意向用户分发。",
		},
		Description:     firstNonEmpty(activity.Description, "这是一个以稳定成局和真实到场为优先目标的同城运动活动。"),
		SuitableCrowd:   suitableCrowd,
		SkillLevelLabel: "默认面向有基础经验的同城运动人群，也欢迎认真沟通的新手。",
		GenderRuleLabel: "不限性别",
		Notices:         notices,
		AllowWaitlist:   activity.WaitlistCapacity > 0,
		ShareSummary:    fmt.Sprintf("%s%s活动，正在稳定成局中。", activity.District, activity.SportLabel),
	}
}

func ToMyActivityItem(
	activity model.Activity,
	count repository.ParticipantCounters,
	role dto.MyActivityRole,
	registrationStatus string,
) dto.MyActivityItem {
	feed := ToActivityFeedItem(activity, count)

	return dto.MyActivityItem{
		ActivityFeedItem:   feed,
		Role:               role,
		RegistrationStatus: registrationStatus,
		CanCancel:          role == dto.MyActivityRoleParticipant,
		CanManage:          role == dto.MyActivityRoleHost,
	}
}

func DeriveActivityStatus(activity model.Activity, count repository.ParticipantCounters) string {
	return deriveActivityStatus(activity, count)
}

func FormatParticipantSummary(capacity, waitlistCapacity int, count repository.ParticipantCounters) string {
	return formatParticipantSummary(capacity, waitlistCapacity, count)
}

func deriveActivityStatus(activity model.Activity, count repository.ParticipantCounters) string {
	if activity.Status == model.ActivityStatusCancelled {
		return model.ActivityStatusCancelled
	}
	if time.Now().After(activity.EndAt) {
		return model.ActivityStatusCompleted
	}
	if time.Now().After(activity.StartAt) {
		return model.ActivityStatusOngoing
	}
	if time.Now().After(activity.SignupDeadlineAt) {
		return model.ActivityStatusSignupClosed
	}
	if count.Registered >= int64(activity.Capacity) {
		return model.ActivityStatusFull
	}
	return model.ActivityStatusPublished
}

func mapStatusTone(status string) dto.ActivityStatusTone {
	switch status {
	case model.ActivityStatusFull:
		return dto.ActivityStatusTone{Label: "名额紧张", Tone: "warning"}
	case model.ActivityStatusSignupClosed:
		return dto.ActivityStatusTone{Label: "报名截止", Tone: "neutral"}
	case model.ActivityStatusOngoing:
		return dto.ActivityStatusTone{Label: "进行中", Tone: "success"}
	case model.ActivityStatusCompleted:
		return dto.ActivityStatusTone{Label: "已完成", Tone: "neutral"}
	case model.ActivityStatusCancelled:
		return dto.ActivityStatusTone{Label: "已取消", Tone: "danger"}
	default:
		return dto.ActivityStatusTone{Label: "报名中", Tone: "success"}
	}
}

func buildSubtitle(activity model.Activity) string {
	return fmt.Sprintf("%s · %s，适合%s稳定成局。", strings.TrimSpace(activity.District), strings.TrimSpace(activity.VenueName), activity.SportLabel)
}

func buildActivityTags(activity model.Activity, status string) []string {
	tags := []string{activity.SportLabel, activity.District}
	if status == model.ActivityStatusPublished {
		tags = append(tags, "可直接成局")
	}
	if activity.WaitlistCapacity > 0 {
		tags = append(tags, "支持候补")
	}
	return tags
}

func buildActionLabel(status string, allowWaitlist bool) string {
	if status == model.ActivityStatusFull && allowWaitlist {
		return "加入候补"
	}
	if status == model.ActivityStatusFull {
		return "已满员"
	}
	return "立即报名"
}

func buildRiskHint(status string, allowWaitlist bool) string {
	if status == model.ActivityStatusFull && allowWaitlist {
		return "当前已接近满员，如有人取消将按候补顺序补位。"
	}
	if status == model.ActivityStatusPublished {
		return "系统会优先分发给高意向、履约稳定的用户，帮助活动更快成局。"
	}
	return ""
}

func formatParticipantSummary(capacity, waitlistCapacity int, count repository.ParticipantCounters) string {
	summary := fmt.Sprintf("已确认 %d / %d 人", count.Registered, capacity)
	if waitlistCapacity > 0 {
		summary += fmt.Sprintf("，候补 %d / %d 人", count.Waitlisted, waitlistCapacity)
	}
	return summary
}

func formatFeeLabel(feeType string, feeAmount float64) string {
	switch feeType {
	case "free":
		return "免费参与"
	case "aa":
		if feeAmount > 0 {
			return fmt.Sprintf("AA 约 %.0f 元", feeAmount)
		}
		return "AA 分摊"
	default:
		return fmt.Sprintf("固定费用 %.0f 元", feeAmount)
	}
}

func buildAttendanceLabel(hostName string) string {
	return fmt.Sprintf("%s近 30 天到场记录稳定", firstNonEmpty(hostName, "主办方"))
}

func buildHostBadge(hostName string) string {
	if hostName == "" {
		return "已认证主办方"
	}
	return "同城活跃主办方"
}

func fallbackUserName(user model.User) string {
	if strings.TrimSpace(user.Nickname) != "" {
		return user.Nickname
	}
	if strings.TrimSpace(user.Phone) != "" {
		return user.Phone
	}
	return "USport 用户"
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
