package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/repository"
	"gorm.io/gorm"
)

type fakeActivityRepository struct {
	activity      *model.Activity
	participants  []model.ActivityParticipant
	updatedStatus string
}

func (r *fakeActivityRepository) ListVisible(context.Context, int) ([]model.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) ListHostedByUser(context.Context, uint, int) ([]model.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) ListJoinedByUser(context.Context, uint, int) ([]repository.JoinedActivity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) FindByIDWithHost(context.Context, uint) (*model.Activity, error) {
	return nil, nil
}

func (r *fakeActivityRepository) LockByID(_ context.Context, activityID uint) (*model.Activity, error) {
	if r.activity == nil || r.activity.ID != activityID {
		return nil, gorm.ErrRecordNotFound
	}

	return r.activity, nil
}

func (r *fakeActivityRepository) Create(context.Context, *model.Activity) error {
	return nil
}

func (r *fakeActivityRepository) UpdateStatus(_ context.Context, activityID uint, status string) error {
	if r.activity == nil || r.activity.ID != activityID {
		return errors.New("activity not found")
	}

	r.activity.Status = status
	r.updatedStatus = status
	return nil
}

func (r *fakeActivityRepository) FindParticipant(_ context.Context, activityID, userID uint) (*model.ActivityParticipant, error) {
	for index := range r.participants {
		participant := r.participants[index]
		if participant.ActivityID == activityID && participant.UserID == userID {
			return &participant, nil
		}
	}

	return nil, nil
}

func (r *fakeActivityRepository) FindFirstWaitlistedParticipant(context.Context, uint) (*model.ActivityParticipant, error) {
	return nil, nil
}

func (r *fakeActivityRepository) CreateParticipant(_ context.Context, participant *model.ActivityParticipant) error {
	r.participants = append(r.participants, *participant)
	return nil
}

func (r *fakeActivityRepository) UpdateParticipantStatus(_ context.Context, activityID, userID uint, status string) error {
	for index := range r.participants {
		if r.participants[index].ActivityID == activityID && r.participants[index].UserID == userID {
			r.participants[index].Status = status
			return nil
		}
	}

	return errors.New("participant not found")
}

func (r *fakeActivityRepository) FinishParticipantsByActivity(_ context.Context, activityID uint) error {
	for index := range r.participants {
		if r.participants[index].ActivityID != activityID {
			continue
		}
		if r.participants[index].Status == model.ParticipantStatusRegistered ||
			r.participants[index].Status == model.ParticipantStatusCheckedIn {
			r.participants[index].Status = model.ParticipantStatusFinished
		}
	}

	return nil
}

func (r *fakeActivityRepository) CancelParticipantsByActivity(context.Context, uint) error {
	return nil
}

func (r *fakeActivityRepository) CountParticipants(_ context.Context, activityIDs []uint) (map[uint]repository.ParticipantCounters, error) {
	result := make(map[uint]repository.ParticipantCounters, len(activityIDs))
	for _, activityID := range activityIDs {
		current := repository.ParticipantCounters{}
		for _, participant := range r.participants {
			if participant.ActivityID != activityID {
				continue
			}

			switch participant.Status {
			case model.ParticipantStatusRegistered:
				current.Registered++
			case model.ParticipantStatusWaitlisted:
				current.Waitlisted++
			}
		}
		result[activityID] = current
	}

	return result, nil
}

func (r *fakeActivityRepository) WithTx(_ context.Context, fn func(repo repository.ActivityRepository) error) error {
	return fn(r)
}

func newFakeActivityRepository() *fakeActivityRepository {
	now := time.Now()

	return &fakeActivityRepository{
		activity: &model.Activity{
			ID:               1001,
			Title:            "周三羽毛球局",
			StartAt:          now.Add(2 * time.Hour),
			EndAt:            now.Add(4 * time.Hour),
			SignupDeadlineAt: now.Add(90 * time.Minute),
			Status:           model.ActivityStatusPublished,
			Capacity:         4,
			WaitlistCapacity: 2,
			CreatedAt:        now,
			UpdatedAt:        now,
		},
		participants: make([]model.ActivityParticipant, 0),
	}
}

func TestRegisterActivityParticipantRegistersDirectly(t *testing.T) {
	repo := newFakeActivityRepository()

	result, err := registerActivityParticipant(context.Background(), repo, 1001, 88)
	if err != nil {
		t.Fatalf("registerActivityParticipant returned error: %v", err)
	}

	if result.Status != model.ParticipantStatusRegistered {
		t.Fatalf("expected registered status, got %s", result.Status)
	}

	if len(repo.participants) != 1 {
		t.Fatalf("expected 1 participant, got %d", len(repo.participants))
	}

	if repo.participants[0].Status != model.ParticipantStatusRegistered {
		t.Fatalf("expected stored participant status to be registered, got %s", repo.participants[0].Status)
	}
}

func TestRegisterActivityParticipantUsesWaitlistWhenFull(t *testing.T) {
	repo := newFakeActivityRepository()
	repo.participants = []model.ActivityParticipant{
		{ActivityID: 1001, UserID: 1, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 2, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 3, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 4, Status: model.ParticipantStatusRegistered},
	}

	result, err := registerActivityParticipant(context.Background(), repo, 1001, 99)
	if err != nil {
		t.Fatalf("registerActivityParticipant returned error: %v", err)
	}

	if result.Status != model.ParticipantStatusWaitlisted {
		t.Fatalf("expected waitlisted status, got %s", result.Status)
	}

	if repo.updatedStatus != model.ActivityStatusFull {
		t.Fatalf("expected activity status to be updated to full, got %s", repo.updatedStatus)
	}
}

func TestRegisterActivityParticipantReturnsCapacityFullWhenWaitlistAlsoFull(t *testing.T) {
	repo := newFakeActivityRepository()
	repo.participants = []model.ActivityParticipant{
		{ActivityID: 1001, UserID: 1, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 2, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 3, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 4, Status: model.ParticipantStatusRegistered},
		{ActivityID: 1001, UserID: 5, Status: model.ParticipantStatusWaitlisted},
		{ActivityID: 1001, UserID: 6, Status: model.ParticipantStatusWaitlisted},
	}

	_, err := registerActivityParticipant(context.Background(), repo, 1001, 101)
	if !errors.Is(err, ErrActivityCapacityFull) {
		t.Fatalf("expected ErrActivityCapacityFull, got %v", err)
	}
}

func TestRegisterActivityParticipantRejectsDuplicateJoin(t *testing.T) {
	repo := newFakeActivityRepository()
	repo.participants = []model.ActivityParticipant{
		{ActivityID: 1001, UserID: 88, Status: model.ParticipantStatusRegistered},
	}

	_, err := registerActivityParticipant(context.Background(), repo, 1001, 88)
	if !errors.Is(err, ErrActivityAlreadyJoined) {
		t.Fatalf("expected ErrActivityAlreadyJoined, got %v", err)
	}
}
