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

var (
	ErrInvitationNotFound       = errors.New("邀约不存在")
	ErrInvitationForbidden      = errors.New("你无权处理这条邀约")
	ErrInvitationInvalidAction  = errors.New("无效的邀约操作")
	ErrInvitationAlreadyHandled = errors.New("邀约已处理，请勿重复操作")
)

type InvitationService interface {
	ListMyInvitations(ctx context.Context, userID uint) ([]dto.InvitationItem, error)
	ListMessagePreviews(ctx context.Context, userID uint) ([]dto.MessagePreview, error)
	RespondInvitation(
		ctx context.Context,
		userID uint,
		invitationID uint,
		action string,
	) (*dto.InvitationItem, error)
}

type invitationService struct {
	db             *gorm.DB
	invitationRepo repository.InvitationRepository
	activityRepo   repository.ActivityRepository
}

func NewInvitationService(
	db *gorm.DB,
	invitationRepo repository.InvitationRepository,
	activityRepo repository.ActivityRepository,
) InvitationService {
	return &invitationService{
		db:             db,
		invitationRepo: invitationRepo,
		activityRepo:   activityRepo,
	}
}

func (s *invitationService) ListMyInvitations(
	ctx context.Context,
	userID uint,
) ([]dto.InvitationItem, error) {
	invitations, err := s.invitationRepo.ListByReceiver(ctx, userID, 50)
	if err != nil {
		return nil, err
	}

	items := make([]dto.InvitationItem, 0, len(invitations))
	for _, invitation := range invitations {
		items = append(items, assembler.ToInvitationItem(invitation))
	}

	return items, nil
}

func (s *invitationService) ListMessagePreviews(
	ctx context.Context,
	userID uint,
) ([]dto.MessagePreview, error) {
	invitations, err := s.invitationRepo.ListByReceiver(ctx, userID, 20)
	if err != nil {
		return nil, err
	}

	items := make([]dto.MessagePreview, 0, len(invitations))
	for _, invitation := range invitations {
		items = append(items, assembler.ToInvitationMessagePreview(invitation))
	}

	return items, nil
}

func (s *invitationService) RespondInvitation(
	ctx context.Context,
	userID uint,
	invitationID uint,
	action string,
) (*dto.InvitationItem, error) {
	status, err := mapInvitationAction(action)
	if err != nil {
		return nil, err
	}

	var updatedInvitation *model.Invitation

	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		invitationRepo := repository.NewInvitationRepository(tx)
		activityRepo := repository.NewActivityRepository(tx)

		invitation, findErr := invitationRepo.FindByIDWithRelations(ctx, invitationID)
		if findErr != nil {
			return findErr
		}
		if invitation == nil {
			return ErrInvitationNotFound
		}
		if invitation.ReceiverUserID != userID {
			return ErrInvitationForbidden
		}
		if invitation.Status != model.InvitationStatusPending {
			return ErrInvitationAlreadyHandled
		}

		if status == model.InvitationStatusAccepted {
			if _, registerErr := registerActivityParticipant(
				ctx,
				activityRepo,
				invitation.ActivityID,
				userID,
			); registerErr != nil {
				return registerErr
			}
		}

		if updateErr := invitationRepo.UpdateStatus(ctx, invitationID, status); updateErr != nil {
			return updateErr
		}

		nextInvitation, nextErr := invitationRepo.FindByIDWithRelations(ctx, invitationID)
		if nextErr != nil {
			return nextErr
		}
		updatedInvitation = nextInvitation
		return nil
	})
	if err != nil {
		return nil, err
	}

	item := assembler.ToInvitationItem(*updatedInvitation)
	return &item, nil
}

func mapInvitationAction(action string) (string, error) {
	switch action {
	case "accept":
		return model.InvitationStatusAccepted, nil
	case "decline":
		return model.InvitationStatusDeclined, nil
	default:
		return "", ErrInvitationInvalidAction
	}
}
