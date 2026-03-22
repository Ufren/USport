package wechat

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/usport/usport-api/internal/config"
)

type WechatService struct {
	appid  string
	secret string
	client *http.Client
}

type Code2SessionResponse struct {
	Openid     string `json:"openid"`
	SessionKey string `json:"session_key"`
	Unionid    string `json:"unionid"`
	Errcode    int    `json:"errcode"`
	Errmsg     string `json:"errmsg"`
}

type PhoneNumberResponse struct {
	Errcode   int    `json:"errcode"`
	Errmsg    string `json:"errmsg"`
	PhoneInfo struct {
		PhoneNumber     string `json:"phoneNumber"`
		PurePhoneNumber string `json:"purePhoneNumber"`
		CountryCode     string `json:"countryCode"`
		Watermark       struct {
			Timestamp int    `json:"timestamp"`
			Appid     string `json:"appid"`
		} `json:"watermark"`
	} `json:"phone_info"`
}

func NewWechatService(cfg *config.WechatConfig) *WechatService {
	return &WechatService{
		appid:  cfg.Appid,
		secret: cfg.Secret,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *WechatService) Code2Session(code string) (*Code2SessionResponse, error) {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
		s.appid, s.secret, code,
	)

	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("请求微信接口失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	var result Code2SessionResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	if result.Errcode != 0 {
		return nil, fmt.Errorf("微信接口错误: %s", result.Errmsg)
	}

	return &result, nil
}

func (s *WechatService) GetPhoneNumber(accessToken, code string) (*PhoneNumberResponse, error) {
	url := fmt.Sprintf(
		"https://api.weixin.qq.com/wxa/business/getphonenumber?access_token=%s",
		accessToken,
	)

	reqBody := map[string]string{"code": code}
	jsonBody, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", url, string(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求微信接口失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	var result PhoneNumberResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	if result.Errcode != 0 {
		return nil, fmt.Errorf("微信接口错误: %s", result.Errmsg)
	}

	return &result, nil
}
