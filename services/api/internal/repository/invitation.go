package repository

import (
	"context"
	"errors"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
)

type InvitationRepository interface {
	ListByReceiver(ctx context.Context, userID uint, limit int) ([]model.Invitation, error)
	FindByIDWithRelations(ctx context.Context, invitationID uint) (*model.Invitation, error)
	UpdateStatus(ctx context.Context, invitationID uint, status string) error
}

type invitationRepository struct {
	db *gorm.DB
}

func NewInvitationRepository(db *gorm.DB) InvitationRepository {
	return &invitationRepository{db: db}
}

func (r *invitationRepository) ListByReceiver(
	ctx context.Context,
	userID uint,
	limit int,
) ([]model.Invitation, error) {
	var invitations []model.Invitation
	err := r.db.WithContext(ctx).
		Preload("Activity").
		Preload("SenderUser").
		Where("receiver_user_id = ?", userID).
		Order("created_at desc").
		Limit(limit).
		Find(&invitations).Error
	return invitations, err
}

func (r *invitationRepository) FindByIDWithRelations(
	ctx context.Context,
	invitationID uint,
) (*model.Invitation, error) {
	var invitation model.Invitation
	err := r.db.WithContext(ctx).
		Preload("Activity").
		Preload("SenderUser").
		First(&invitation, invitationID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &invitation, nil
}

func (r *invitationRepository) UpdateStatus(
	ctx context.Context,
	invitationID uint,
	status string,
) error {
	return r.db.WithContext(ctx).
		Model(&model.Invitation{}).
		Where("id = ?", invitationID).
		Update("status", status).Error
}
