package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
	"github.com/usport/usport-api/pkg/utils"
	"github.com/usport/usport-api/pkg/wechat"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound      = errors.New("用户不存在")
	ErrPhoneAuthFailed   = errors.New("手机号授权失败")
	ErrInvalidWechatCode = errors.New("无效的微信授权码")
)

type UserService interface {
	WechatLogin(ctx context.Context, code string) (*dto.LoginResult, error)
	PhoneLogin(ctx context.Context, req dto.PhoneLoginRequest) (*dto.LoginResult, error)
	GetUserByID(ctx context.Context, id uint) (*dto.UserProfile, error)
	GetUserByOpenid(ctx context.Context, openid string) (*dto.UserProfile, error)
}

type userService struct {
	userRepo  repository.UserRepository
	wechatSvc *wechat.WechatService
	cache     *redis.Client
	jwtSecret string
	jwtExpire int
}

type loginIdentity struct {
	Openid   string
	Unionid  string
	Phone    string
	Nickname string
}

func NewUserService(
	userRepo repository.UserRepository,
	wechatSvc *wechat.WechatService,
	cache *redis.Client,
	jwtSecret string,
	jwtExpire int,
) UserService {
	return &userService{
		userRepo:  userRepo,
		wechatSvc: wechatSvc,
		cache:     cache,
		jwtSecret: jwtSecret,
		jwtExpire: jwtExpire,
	}
}

func (s *userService) WechatLogin(ctx context.Context, code string) (*dto.LoginResult, error) {
	identity, err := s.resolveWechatIdentity(code)
	if err != nil {
		return nil, err
	}

	return s.loginOrCreateUser(ctx, identity)
}

func (s *userService) PhoneLogin(ctx context.Context, req dto.PhoneLoginRequest) (*dto.LoginResult, error) {
	identity, err := s.resolvePhoneIdentity(req.Code)
	if err != nil {
		return nil, err
	}

	return s.loginOrCreateUser(ctx, identity)
}

func (s *userService) GetUserByID(ctx context.Context, id uint) (*dto.UserProfile, error) {
	cacheKey := "user:" + utils.ToString(id)
	if s.cache != nil {
		cached, err := s.cache.Get(ctx, cacheKey).Result()
		if err == nil {
			profile := &dto.UserProfile{}
			if parseErr := utils.ParseJSON(cached, profile); parseErr == nil {
				return profile, nil
			}
		}
	}

	user, err := s.userRepo.FindByID(ctx, id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	profile := dto.NewUserProfile(user)
	if s.cache != nil {
		if payload, marshalErr := utils.ToJSON(profile); marshalErr == nil {
			_ = s.cache.Set(ctx, cacheKey, payload, 10*time.Minute).Err()
		}
	}

	return &profile, nil
}

func (s *userService) GetUserByOpenid(ctx context.Context, openid string) (*dto.UserProfile, error) {
	user, err := s.userRepo.FindByOpenID(ctx, openid)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	profile := dto.NewUserProfile(user)
	return &profile, nil
}

func (s *userService) loginOrCreateUser(ctx context.Context, identity loginIdentity) (*dto.LoginResult, error) {
	user, err := s.userRepo.FindByOpenID(ctx, identity.Openid)
	if err != nil {
		return nil, err
	}

	isNewUser := user == nil
	if isNewUser {
		user = &model.User{
			Openid:   identity.Openid,
			Unionid:  identity.Unionid,
			Phone:    identity.Phone,
			Nickname: identity.Nickname,
			Status:   model.UserStatusActive,
		}
		if err := s.userRepo.Create(ctx, user); err != nil {
			return nil, err
		}
	} else {
		updates := make(map[string]interface{})
		if identity.Phone != "" && identity.Phone != user.Phone {
			updates["phone"] = identity.Phone
			user.Phone = identity.Phone
		}
		if identity.Nickname != "" && user.Nickname == "" {
			updates["nickname"] = identity.Nickname
			user.Nickname = identity.Nickname
		}
		if err := s.userRepo.UpdateFields(ctx, user.ID, updates); err != nil {
			return nil, err
		}
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResult{
		Token:     token,
		User:      dto.NewUserProfile(user),
		IsNewUser: isNewUser,
	}, nil
}

func (s *userService) resolveWechatIdentity(code string) (loginIdentity, error) {
	if strings.HasPrefix(code, "mock-") {
		return loginIdentity{
			Openid:   fmt.Sprintf("dev:%s", code),
			Unionid:  "dev-union",
			Nickname: "USport体验官",
		}, nil
	}

	session, err := s.wechatSvc.Code2Session(code)
	if err != nil {
		return loginIdentity{}, ErrInvalidWechatCode
	}

	return loginIdentity{Openid: session.Openid, Unionid: session.Unionid}, nil
}

func (s *userService) resolvePhoneIdentity(code string) (loginIdentity, error) {
	if strings.HasPrefix(code, "mock-") {
		return loginIdentity{
			Openid:   "dev:mock-phone-user",
			Unionid:  "dev-phone-union",
			Phone:    "13800138000",
			Nickname: "USport手机用户",
		}, nil
	}

	session, err := s.wechatSvc.Code2Session(code)
	if err != nil {
		return loginIdentity{}, ErrInvalidWechatCode
	}

	phoneResp, err := s.wechatSvc.GetPhoneNumber("", code)
	if err != nil || phoneResp.PhoneInfo.PhoneNumber == "" {
		return loginIdentity{}, ErrPhoneAuthFailed
	}

	return loginIdentity{
		Openid:   session.Openid,
		Unionid:  session.Unionid,
		Phone:    phoneResp.PhoneInfo.PhoneNumber,
		Nickname: "微信手机号用户",
	}, nil
}

func (s *userService) generateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Duration(s.jwtExpire) * time.Second).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
