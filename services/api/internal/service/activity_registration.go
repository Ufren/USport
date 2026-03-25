package service

import (
	"context"
	"errors"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/assembler"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
	"gorm.io/gorm"
)

// registerActivityParticipant 统一处理活动报名与候补补位规则，避免多入口下规则漂移。
func registerActivityParticipant(
	ctx context.Context,
	repo repository.ActivityRepository,
	activityID, userID uint,
) (*dto.RegisterActivityResult, error) {
	result := &dto.RegisterActivityResult{}

	activity, err := repo.LockByID(ctx, activityID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrActivityNotFound
	}
	if err != nil {
		return nil, err
	}

	existingParticipant, err := repo.FindParticipant(ctx, activityID, userID)
	if err != nil {
		return nil, err
	}
	if existingParticipant != nil && existingParticipant.Status != model.ParticipantStatusCancelled {
		return nil, ErrActivityAlreadyJoined
	}

	counts, err := repo.CountParticipants(ctx, []uint{activityID})
	if err != nil {
		return nil, err
	}
	current := counts[activityID]

	status := model.ParticipantStatusRegistered
	switch {
	case current.Registered < int64(activity.Capacity):
		status = model.ParticipantStatusRegistered
	case activity.WaitlistCapacity > 0 && current.Waitlisted < int64(activity.WaitlistCapacity):
		status = model.ParticipantStatusWaitlisted
	default:
		return nil, ErrActivityCapacityFull
	}

	if err := repo.CreateParticipant(ctx, &model.ActivityParticipant{
		ActivityID: activityID,
		UserID:     userID,
		Status:     status,
	}); err != nil {
		return nil, err
	}

	if status == model.ParticipantStatusRegistered {
		current.Registered++
	} else {
		current.Waitlisted++
	}

	nextStatus := assembler.DeriveActivityStatus(*activity, current)
	if nextStatus != activity.Status {
		if err := repo.UpdateStatus(ctx, activityID, nextStatus); err != nil {
			return nil, err
		}
	}

	result.Status = status
	result.ParticipantSummary = assembler.FormatParticipantSummary(
		activity.Capacity,
		activity.WaitlistCapacity,
		current,
	)

	return result, nil
}
