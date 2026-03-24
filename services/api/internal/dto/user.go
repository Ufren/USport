package dto

import "github.com/usport/usport-api/dal/model"

type PhoneLoginRequest struct {
	Code string `json:"code" binding:"required"`
}

type UserProfile struct {
	ID        uint   `json:"id"`
	Openid    string `json:"openid,omitempty"`
	Unionid   string `json:"unionid,omitempty"`
	Phone     string `json:"phone,omitempty"`
	Nickname  string `json:"nickname,omitempty"`
	Avatar    string `json:"avatar,omitempty"`
	Status    int    `json:"status"`
	CreatedAt string `json:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty"`
}

type LoginResult struct {
	Token     string      `json:"token"`
	User      UserProfile `json:"user"`
	IsNewUser bool        `json:"is_new_user"`
}

func NewUserProfile(user *model.User) UserProfile {
	if user == nil {
		return UserProfile{}
	}

	profile := UserProfile{
		ID:       user.ID,
		Openid:   user.Openid,
		Unionid:  user.Unionid,
		Phone:    user.Phone,
		Nickname: user.Nickname,
		Avatar:   user.Avatar,
		Status:   user.Status,
	}
	if !user.CreatedAt.IsZero() {
		profile.CreatedAt = user.CreatedAt.Format("2006-01-02 15:04:05")
	}
	if !user.UpdatedAt.IsZero() {
		profile.UpdatedAt = user.UpdatedAt.Format("2006-01-02 15:04:05")
	}

	return profile
}
