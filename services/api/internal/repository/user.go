package repository

import (
	"context"
	"errors"

	"github.com/usport/usport-api/dal/model"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByID(ctx context.Context, id uint) (*model.User, error)
	FindByOpenID(ctx context.Context, openid string) (*model.User, error)
	Create(ctx context.Context, user *model.User) error
	UpdateFields(ctx context.Context, userID uint, updates map[string]interface{}) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(ctx context.Context, id uint) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByOpenID(ctx context.Context, openid string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("openid = ?", openid).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) UpdateFields(ctx context.Context, userID uint, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", userID).
		Updates(updates).Error
}
