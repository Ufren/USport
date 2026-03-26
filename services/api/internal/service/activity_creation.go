package service

import (
	"context"
	"errors"
	"strings"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
)

func createActivityRecord(
	ctx context.Context,
	repo repository.ActivityRepository,
	hostUserID uint,
	req dto.CreateActivityRequest,
	isOfficial bool,
) (*model.Activity, error) {
	startAt, err := parseActivityDateTime(req.Date, req.StartTime)
	if err != nil {
		return nil, errors.New("开始时间格式不正确")
	}
	endAt, err := parseActivityDateTime(req.Date, req.EndTime)
	if err != nil {
		return nil, errors.New("结束时间格式不正确")
	}
	deadlineAt, err := parseActivityDateTime(req.Date, req.DeadlineTime)
	if err != nil {
		return nil, errors.New("报名截止时间格式不正确")
	}
	if !endAt.After(startAt) {
		return nil, errors.New("结束时间必须晚于开始时间")
	}
	if deadlineAt.After(startAt) {
		return nil, errors.New("报名截止时间不能晚于开始时间")
	}
	if req.Capacity <= 1 {
		return nil, errors.New("活动人数至少为 2 人")
	}

	feeAmount, err := parseFeeAmount(req.FeeAmount)
	if err != nil {
		return nil, err
	}

	activity := &model.Activity{
		HostUserID:       hostUserID,
		IsOfficial:       isOfficial,
		Title:            strings.TrimSpace(req.Title),
		Description:      strings.TrimSpace(req.Description),
		SportCode:        req.SportCode,
		SportLabel:       toSportLabel(req.SportCode),
		District:         strings.TrimSpace(req.District),
		VenueName:        strings.TrimSpace(req.VenueName),
		AddressHint:      "创建完成后可继续补充集合点与场馆说明。",
		StartAt:          startAt,
		EndAt:            endAt,
		SignupDeadlineAt: deadlineAt,
		Capacity:         req.Capacity,
		WaitlistCapacity: maxInt(req.WaitlistCapacity, 0),
		FeeType:          req.FeeType,
		FeeAmount:        feeAmount,
		JoinRule:         req.JoinRule,
		Visibility:       req.Visibility,
		Status:           model.ActivityStatusPublished,
		SuitableCrowd: []string{
			joinRuleLabel(req.JoinRule),
			visibilityLabel(req.Visibility),
		},
		Notices: []string{
			"建议提前 15 分钟到场，便于热身与集合。",
			"如无法参加，请在截止前取消，避免影响信用记录。",
		},
	}

	if isOfficial {
		activity.SuitableCrowd = append(activity.SuitableCrowd, "官方活动")
		activity.Notices = append(activity.Notices, "如遇天气或场馆异常，平台会优先通知并处理。")
	} else {
		activity.SuitableCrowd = append(activity.SuitableCrowd, "新发布")
	}

	if err := repo.Create(ctx, activity); err != nil {
		return nil, err
	}

	participant := &model.ActivityParticipant{
		ActivityID: activity.ID,
		UserID:     hostUserID,
		Status:     model.ParticipantStatusRegistered,
	}
	if err := repo.CreateParticipant(ctx, participant); err != nil {
		return nil, err
	}

	return activity, nil
}
