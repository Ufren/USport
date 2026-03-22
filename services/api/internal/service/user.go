package service

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/dal/query"
	"github.com/usport/usport-api/pkg/redis"
	"github.com/usport/usport-api/pkg/utils"
	"github.com/usport/usport-api/pkg/wechat"
)

var (
	ErrUserNotFound      = errors.New("用户不存在")
	ErrWechatAuthFailed  = errors.New("微信授权失败")
	ErrPhoneAuthFailed   = errors.New("手机号授权失败")
	ErrInvalidWechatCode = errors.New("无效的微信授权码")
)

type UserService interface {
	WechatLogin(ctx context.Context, code string) (*LoginResult, error)
	PhoneLogin(ctx context.Context, req PhoneLoginRequest) (*LoginResult, error)
	GetUserByID(ctx context.Context, id uint) (*model.User, error)
	GetUserByOpenid(ctx context.Context, openid string) (*model.User, error)
}

type PhoneLoginRequest struct {
	Code string `json:"code" binding:"required"`
}

type LoginResult struct {
	Token     string      `json:"token"`
	User      *model.User `json:"user"`
	IsNewUser bool        `json:"is_new_user"`
}

type userService struct {
	userQuery *query.Query
	wechatSvc *wechat.WechatService
	cache     *redis.Client
	jwtSecret string
	jwtExpire int
}

func NewUserService(
	dbQuery *query.Query,
	wechatSvc *wechat.WechatService,
	cache *redis.Client,
	jwtSecret string,
	jwtExpire int,
) UserService {
	return &userService{
		userQuery: dbQuery,
		wechatSvc: wechatSvc,
		cache:     cache,
		jwtSecret: jwtSecret,
		jwtExpire: jwtExpire,
	}
}

func (s *userService) WechatLogin(ctx context.Context, code string) (*LoginResult, error) {
	session, err := s.wechatSvc.Code2Session(code)
	if err != nil {
		return nil, ErrInvalidWechatCode
	}

	existingUser, _ := s.userQuery.User.WithContext(ctx).Where(s.userQuery.User.Openid.Eq(session.Openid)).First()
	if existingUser != nil {
		token, err := s.generateToken(existingUser.ID)
		if err != nil {
			return nil, err
		}
		return &LoginResult{
			Token:     token,
			User:      existingUser,
			IsNewUser: false,
		}, nil
	}

	newUser := &model.User{
		Openid:  session.Openid,
		Unionid: session.Unionid,
		Status:  1,
	}
	if err := s.userQuery.User.WithContext(ctx).Create(newUser); err != nil {
		return nil, err
	}

	token, err := s.generateToken(newUser.ID)
	if err != nil {
		return nil, err
	}

	return &LoginResult{
		Token:     token,
		User:      newUser,
		IsNewUser: true,
	}, nil
}

func (s *userService) PhoneLogin(ctx context.Context, req PhoneLoginRequest) (*LoginResult, error) {
	session, err := s.wechatSvc.Code2Session(req.Code)
	if err != nil {
		return nil, ErrInvalidWechatCode
	}

	phoneResp, err := s.wechatSvc.GetPhoneNumber("", req.Code)
	if err != nil {
		return nil, ErrPhoneAuthFailed
	}

	existingUser, _ := s.userQuery.User.WithContext(ctx).Where(s.userQuery.User.Openid.Eq(session.Openid)).First()
	if existingUser != nil {
		if phoneResp.PhoneInfo.PhoneNumber != "" {
			existingUser.Phone = phoneResp.PhoneInfo.PhoneNumber
			s.userQuery.User.WithContext(ctx).Save(existingUser)
		}
		token, err := s.generateToken(existingUser.ID)
		if err != nil {
			return nil, err
		}
		return &LoginResult{
			Token:     token,
			User:      existingUser,
			IsNewUser: false,
		}, nil
	}

	newUser := &model.User{
		Openid:  session.Openid,
		Unionid: session.Unionid,
		Phone:   phoneResp.PhoneInfo.PhoneNumber,
		Status:  1,
	}
	if err := s.userQuery.User.WithContext(ctx).Create(newUser); err != nil {
		return nil, err
	}

	token, err := s.generateToken(newUser.ID)
	if err != nil {
		return nil, err
	}

	return &LoginResult{
		Token:     token,
		User:      newUser,
		IsNewUser: true,
	}, nil
}

func (s *userService) GetUserByID(ctx context.Context, id uint) (*model.User, error) {
	cacheKey := "user:" + utils.ToString(id)

	cached, err := s.cache.Get(ctx, cacheKey).Result()
	if err == nil {
		user := &model.User{}
		if err := utils.ParseJSON(cached, user); err == nil {
			return user, nil
		}
	}

	user, err := s.userQuery.User.WithContext(ctx).Where(s.userQuery.User.ID.Eq(id)).First()
	if err != nil {
		return nil, ErrUserNotFound
	}

	if data, err := utils.ToJSON(user); err == nil {
		s.cache.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	return user, nil
}

func (s *userService) GetUserByOpenid(ctx context.Context, openid string) (*model.User, error) {
	user, err := s.userQuery.User.WithContext(ctx).Where(s.userQuery.User.Openid.Eq(openid)).First()
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
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
