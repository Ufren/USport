package service

import (
	"context"
	"errors"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrActivityCannotCheckIn    = errors.New("当前状态不可签到")
	ErrActivityAlreadyCheckedIn = errors.New("你已经完成签到")
	ErrActivityCannotFinish     = errors.New("当前状态不可完赛")
)

func (s *activityService) CheckInActivity(
	ctx context.Context,
	userID,
	activityID uint,
) error {
	activity, err := s.activityRepo.FindByIDWithHost(ctx, activityID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrActivityNotFound
	}
	if err != nil {
		return err
	}

	participant, err := s.activityRepo.FindParticipant(ctx, activityID, userID)
	if err != nil {
		return err
	}
	if participant == nil {
		return ErrActivityNotFound
	}
	if participant.Status == model.ParticipantStatusCheckedIn ||
		participant.Status == model.ParticipantStatusFinished {
		return ErrActivityAlreadyCheckedIn
	}
	if participant.Status != model.ParticipantStatusRegistered {
		return ErrActivityCannotCheckIn
	}

	now := time.Now()
	if activity.Status == model.ActivityStatusCancelled ||
		now.Before(activity.StartAt) ||
		now.After(activity.EndAt) {
		return ErrActivityCannotCheckIn
	}

	return s.activityRepo.UpdateParticipantStatus(
		ctx,
		activityID,
		userID,
		model.ParticipantStatusCheckedIn,
	)
}

func (s *activityService) FinishActivity(
	ctx context.Context,
	userID,
	activityID uint,
) error {
	return s.activityRepo.WithTx(ctx, func(repo repository.ActivityRepository) error {
		activity, err := repo.LockByID(ctx, activityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrActivityNotFound
		}
		if err != nil {
			return err
		}
		if activity.HostUserID != userID {
			return ErrActivityNotHost
		}
		if activity.Status == model.ActivityStatusCancelled ||
			activity.Status == model.ActivityStatusCompleted ||
			time.Now().Before(activity.StartAt) {
			return ErrActivityCannotFinish
		}

		if err := repo.FinishParticipantsByActivity(ctx, activityID); err != nil {
			return err
		}

		return repo.UpdateStatus(ctx, activityID, model.ActivityStatusCompleted)
	})
}
