package repository

import (
	"context"
	"errors"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type ParticipantCounters struct {
	Registered int64
	Waitlisted int64
}

type JoinedActivity struct {
	Activity          model.Activity
	ParticipantStatus string
}

type ActivityRepository interface {
	ListVisible(ctx context.Context, limit int) ([]model.Activity, error)
	ListHostedByUser(ctx context.Context, userID uint, limit int) ([]model.Activity, error)
	ListJoinedByUser(ctx context.Context, userID uint, limit int) ([]JoinedActivity, error)
	FindByIDWithHost(ctx context.Context, activityID uint) (*model.Activity, error)
	LockByID(ctx context.Context, activityID uint) (*model.Activity, error)
	Create(ctx context.Context, activity *model.Activity) error
	UpdateStatus(ctx context.Context, activityID uint, status string) error
	FindParticipant(ctx context.Context, activityID, userID uint) (*model.ActivityParticipant, error)
	FindFirstWaitlistedParticipant(ctx context.Context, activityID uint) (*model.ActivityParticipant, error)
	CreateParticipant(ctx context.Context, participant *model.ActivityParticipant) error
	UpdateParticipantStatus(ctx context.Context, activityID, userID uint, status string) error
	FinishParticipantsByActivity(ctx context.Context, activityID uint) error
	CancelParticipantsByActivity(ctx context.Context, activityID uint) error
	CountParticipants(ctx context.Context, activityIDs []uint) (map[uint]ParticipantCounters, error)
	WithTx(ctx context.Context, fn func(repo ActivityRepository) error) error
}

type activityRepository struct {
	db *gorm.DB
}

func NewActivityRepository(db *gorm.DB) ActivityRepository {
	return &activityRepository{db: db}
}

func (r *activityRepository) ListVisible(ctx context.Context, limit int) ([]model.Activity, error) {
	var activities []model.Activity
	err := r.db.WithContext(ctx).
		Preload("HostUser").
		Where("status IN ?", []string{model.ActivityStatusPublished, model.ActivityStatusFull}).
		Order("start_at asc").
		Limit(limit).
		Find(&activities).Error
	return activities, err
}

func (r *activityRepository) ListHostedByUser(ctx context.Context, userID uint, limit int) ([]model.Activity, error) {
	var activities []model.Activity
	err := r.db.WithContext(ctx).
		Preload("HostUser").
		Where("host_user_id = ?", userID).
		Order("start_at asc").
		Limit(limit).
		Find(&activities).Error
	return activities, err
}

func (r *activityRepository) ListJoinedByUser(ctx context.Context, userID uint, limit int) ([]JoinedActivity, error) {
	var participants []model.ActivityParticipant
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Where("status IN ?", []string{
			model.ParticipantStatusRegistered,
			model.ParticipantStatusWaitlisted,
			model.ParticipantStatusCheckedIn,
			model.ParticipantStatusFinished,
		}).
		Order("created_at desc").
		Limit(limit).
		Find(&participants).Error; err != nil {
		return nil, err
	}

	if len(participants) == 0 {
		return []JoinedActivity{}, nil
	}

	activityIDs := make([]uint, 0, len(participants))
	statusByActivityID := make(map[uint]string, len(participants))
	for _, participant := range participants {
		activityIDs = append(activityIDs, participant.ActivityID)
		statusByActivityID[participant.ActivityID] = participant.Status
	}

	var activities []model.Activity
	if err := r.db.WithContext(ctx).
		Preload("HostUser").
		Where("id IN ?", activityIDs).
		Order("start_at asc").
		Find(&activities).Error; err != nil {
		return nil, err
	}

	result := make([]JoinedActivity, 0, len(activities))
	for _, activity := range activities {
		result = append(result, JoinedActivity{
			Activity:          activity,
			ParticipantStatus: statusByActivityID[activity.ID],
		})
	}

	return result, nil
}

func (r *activityRepository) FindByIDWithHost(ctx context.Context, activityID uint) (*model.Activity, error) {
	var activity model.Activity
	if err := r.db.WithContext(ctx).
		Preload("HostUser").
		First(&activity, activityID).Error; err != nil {
		return nil, err
	}

	return &activity, nil
}

func (r *activityRepository) LockByID(ctx context.Context, activityID uint) (*model.Activity, error) {
	var activity model.Activity
	if err := r.db.WithContext(ctx).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		First(&activity, activityID).Error; err != nil {
		return nil, err
	}

	return &activity, nil
}

func (r *activityRepository) Create(ctx context.Context, activity *model.Activity) error {
	return r.db.WithContext(ctx).Create(activity).Error
}

func (r *activityRepository) UpdateStatus(ctx context.Context, activityID uint, status string) error {
	return r.db.WithContext(ctx).
		Model(&model.Activity{}).
		Where("id = ?", activityID).
		Update("status", status).Error
}

func (r *activityRepository) FindParticipant(ctx context.Context, activityID, userID uint) (*model.ActivityParticipant, error) {
	var participant model.ActivityParticipant
	err := r.db.WithContext(ctx).
		Where("activity_id = ? AND user_id = ?", activityID, userID).
		First(&participant).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &participant, nil
}

func (r *activityRepository) CreateParticipant(ctx context.Context, participant *model.ActivityParticipant) error {
	return r.db.WithContext(ctx).Create(participant).Error
}

func (r *activityRepository) FindFirstWaitlistedParticipant(ctx context.Context, activityID uint) (*model.ActivityParticipant, error) {
	var participant model.ActivityParticipant
	err := r.db.WithContext(ctx).
		Where("activity_id = ? AND status = ?", activityID, model.ParticipantStatusWaitlisted).
		Order("created_at asc").
		First(&participant).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &participant, nil
}

func (r *activityRepository) UpdateParticipantStatus(ctx context.Context, activityID, userID uint, status string) error {
	return r.db.WithContext(ctx).
		Model(&model.ActivityParticipant{}).
		Where("activity_id = ? AND user_id = ?", activityID, userID).
		Update("status", status).Error
}

func (r *activityRepository) FinishParticipantsByActivity(ctx context.Context, activityID uint) error {
	return r.db.WithContext(ctx).
		Model(&model.ActivityParticipant{}).
		Where("activity_id = ?", activityID).
		Where("status IN ?", []string{
			model.ParticipantStatusRegistered,
			model.ParticipantStatusCheckedIn,
		}).
		Update("status", model.ParticipantStatusFinished).Error
}

func (r *activityRepository) CancelParticipantsByActivity(ctx context.Context, activityID uint) error {
	return r.db.WithContext(ctx).
		Model(&model.ActivityParticipant{}).
		Where("activity_id = ?", activityID).
		Where("status IN ?", []string{
			model.ParticipantStatusRegistered,
			model.ParticipantStatusWaitlisted,
			model.ParticipantStatusCheckedIn,
		}).
		Update("status", model.ParticipantStatusCancelled).Error
}

func (r *activityRepository) CountParticipants(ctx context.Context, activityIDs []uint) (map[uint]ParticipantCounters, error) {
	result := make(map[uint]ParticipantCounters, len(activityIDs))
	if len(activityIDs) == 0 {
		return result, nil
	}

	type row struct {
		ActivityID uint
		Status     string
		Count      int64
	}

	var rows []row
	err := r.db.WithContext(ctx).
		Model(&model.ActivityParticipant{}).
		Select("activity_id, status, COUNT(*) AS count").
		Where("activity_id IN ?", activityIDs).
		Where("status IN ?", []string{
			model.ParticipantStatusRegistered,
			model.ParticipantStatusWaitlisted,
			model.ParticipantStatusCheckedIn,
			model.ParticipantStatusFinished,
		}).
		Group("activity_id, status").
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, item := range rows {
		current := result[item.ActivityID]
		switch item.Status {
		case model.ParticipantStatusRegistered, model.ParticipantStatusCheckedIn, model.ParticipantStatusFinished:
			current.Registered += item.Count
		case model.ParticipantStatusWaitlisted:
			current.Waitlisted += item.Count
		}
		result[item.ActivityID] = current
	}

	return result, nil
}

func (r *activityRepository) WithTx(ctx context.Context, fn func(repo ActivityRepository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(&activityRepository{db: tx})
	})
}
