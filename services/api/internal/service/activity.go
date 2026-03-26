package service

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/assembler"
	"github.com/usport/usport-api/internal/dto"
	"github.com/usport/usport-api/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrActivityNotFound      = errors.New("活动不存在")
	ErrActivityCapacityFull  = errors.New("活动名额已满")
	ErrActivityAlreadyJoined = errors.New("你已加入该活动")
	ErrActivityNotHost       = errors.New("只有主办方可以取消活动")
)

type ActivityService interface {
	ListActivities(ctx context.Context) ([]dto.ActivityFeedItem, error)
	GetActivityDetail(ctx context.Context, activityID uint) (*dto.ActivityDetail, error)
	ListMyActivities(ctx context.Context, userID uint, role string) ([]dto.MyActivityItem, error)
	CreateActivity(ctx context.Context, userID uint, req dto.CreateActivityRequest) (*dto.ActivityDetail, error)
	RegisterActivity(ctx context.Context, userID, activityID uint) (*dto.RegisterActivityResult, error)
	CheckInActivity(ctx context.Context, userID, activityID uint) error
	FinishActivity(ctx context.Context, userID, activityID uint) error
	CancelRegistration(ctx context.Context, userID, activityID uint) error
	CancelActivity(ctx context.Context, userID, activityID uint) error
}

type activityService struct {
	activityRepo repository.ActivityRepository
}

func NewActivityService(activityRepo repository.ActivityRepository) ActivityService {
	return &activityService{activityRepo: activityRepo}
}

func (s *activityService) ListActivities(ctx context.Context) ([]dto.ActivityFeedItem, error) {
	activities, err := s.activityRepo.ListVisible(ctx, 20)
	if err != nil {
		return nil, err
	}

	ids := make([]uint, 0, len(activities))
	for _, activity := range activities {
		ids = append(ids, activity.ID)
	}

	counts, err := s.activityRepo.CountParticipants(ctx, ids)
	if err != nil {
		return nil, err
	}

	items := make([]dto.ActivityFeedItem, 0, len(activities))
	for _, activity := range activities {
		items = append(items, assembler.ToActivityFeedItem(activity, counts[activity.ID]))
	}

	return items, nil
}

func (s *activityService) GetActivityDetail(ctx context.Context, activityID uint) (*dto.ActivityDetail, error) {
	activity, err := s.activityRepo.FindByIDWithHost(ctx, activityID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrActivityNotFound
	}
	if err != nil {
		return nil, err
	}

	counts, err := s.activityRepo.CountParticipants(ctx, []uint{activityID})
	if err != nil {
		return nil, err
	}

	detail := assembler.ToActivityDetail(*activity, counts[activity.ID])
	return &detail, nil
}

func (s *activityService) ListMyActivities(ctx context.Context, userID uint, role string) ([]dto.MyActivityItem, error) {
	items := make([]dto.MyActivityItem, 0)
	seen := make(map[uint]struct{})

	appendHosted := role == "" || role == string(dto.MyActivityRoleHost) || role == "all"
	appendJoined := role == "" || role == string(dto.MyActivityRoleParticipant) || role == "all"

	if appendHosted {
		hosted, err := s.activityRepo.ListHostedByUser(ctx, userID, 50)
		if err != nil {
			return nil, err
		}
		if len(hosted) > 0 {
			ids := make([]uint, 0, len(hosted))
			for _, activity := range hosted {
				ids = append(ids, activity.ID)
			}
			counts, err := s.activityRepo.CountParticipants(ctx, ids)
			if err != nil {
				return nil, err
			}
			for _, activity := range hosted {
				items = append(items, assembler.ToMyActivityItem(activity, counts[activity.ID], dto.MyActivityRoleHost, model.ParticipantStatusRegistered))
				seen[activity.ID] = struct{}{}
			}
		}
	}

	if appendJoined {
		joined, err := s.activityRepo.ListJoinedByUser(ctx, userID, 50)
		if err != nil {
			return nil, err
		}
		if len(joined) > 0 {
			ids := make([]uint, 0, len(joined))
			for _, record := range joined {
				if _, exists := seen[record.Activity.ID]; exists {
					continue
				}
				ids = append(ids, record.Activity.ID)
			}
			counts, err := s.activityRepo.CountParticipants(ctx, ids)
			if err != nil {
				return nil, err
			}
			for _, record := range joined {
				if _, exists := seen[record.Activity.ID]; exists {
					continue
				}
				items = append(items, assembler.ToMyActivityItem(record.Activity, counts[record.Activity.ID], dto.MyActivityRoleParticipant, record.ParticipantStatus))
				seen[record.Activity.ID] = struct{}{}
			}
		}
	}

	return items, nil
}

func (s *activityService) CreateActivity(ctx context.Context, userID uint, req dto.CreateActivityRequest) (*dto.ActivityDetail, error) {
	startAt, err := parseActivityDateTime(req.Date, req.StartTime)
	if err != nil {
		return nil, errors.New("开始时间格式不正确")
	}
	endAt, err := parseActivityDateTime(req.Date, req.EndTime)
	if err != nil {
		return nil, errors.New("结束时间格式不正确")
	}
	deadlineAt, err := parseActivityDateTime(req.Date, req.DeadlineTime)
	if err != nil {
		return nil, errors.New("报名截止时间格式不正确")
	}
	if !endAt.After(startAt) {
		return nil, errors.New("结束时间必须晚于开始时间")
	}
	if deadlineAt.After(startAt) {
		return nil, errors.New("报名截止时间不能晚于开始时间")
	}
	if req.Capacity <= 1 {
		return nil, errors.New("活动人数至少为 2 人")
	}

	feeAmount, err := parseFeeAmount(req.FeeAmount)
	if err != nil {
		return nil, err
	}

	activity := &model.Activity{
		HostUserID:       userID,
		Title:            strings.TrimSpace(req.Title),
		Description:      strings.TrimSpace(req.Description),
		SportCode:        req.SportCode,
		SportLabel:       toSportLabel(req.SportCode),
		District:         strings.TrimSpace(req.District),
		VenueName:        strings.TrimSpace(req.VenueName),
		AddressHint:      "已创建活动，后续可继续补充集合点与路线说明。",
		StartAt:          startAt,
		EndAt:            endAt,
		SignupDeadlineAt: deadlineAt,
		Capacity:         req.Capacity,
		WaitlistCapacity: maxInt(req.WaitlistCapacity, 0),
		FeeType:          req.FeeType,
		FeeAmount:        feeAmount,
		JoinRule:         req.JoinRule,
		Visibility:       req.Visibility,
		Status:           model.ActivityStatusPublished,
		SuitableCrowd: []string{
			joinRuleLabel(req.JoinRule),
			visibilityLabel(req.Visibility),
			"新发布",
		},
		Notices: []string{
			"建议先邀请 3 到 5 位高意向用户，提高成局率。",
			"如无法参加，请在截止时间前取消，避免影响信用记录。",
		},
	}

	if err := s.activityRepo.Create(ctx, activity); err != nil {
		return nil, err
	}

	// 主办方默认占用一个正式名额，方便活动刚创建时就具备真实成局进度。
	participant := &model.ActivityParticipant{
		ActivityID: activity.ID,
		UserID:     userID,
		Status:     model.ParticipantStatusRegistered,
	}
	if err := s.activityRepo.CreateParticipant(ctx, participant); err != nil {
		return nil, err
	}

	return s.GetActivityDetail(ctx, activity.ID)
}

func (s *activityService) RegisterActivity(ctx context.Context, userID, activityID uint) (*dto.RegisterActivityResult, error) {
	var result *dto.RegisterActivityResult

	err := s.activityRepo.WithTx(ctx, func(repo repository.ActivityRepository) error {
		nextResult, registerErr := registerActivityParticipant(ctx, repo, activityID, userID)
		if registerErr != nil {
			return registerErr
		}
		result = nextResult
		return nil
	})
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *activityService) CancelRegistration(ctx context.Context, userID, activityID uint) error {
	return s.activityRepo.WithTx(ctx, func(repo repository.ActivityRepository) error {
		activity, err := repo.LockByID(ctx, activityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrActivityNotFound
		}
		if err != nil {
			return err
		}

		participant, err := repo.FindParticipant(ctx, activityID, userID)
		if err != nil {
			return err
		}
		if participant == nil || participant.Status == model.ParticipantStatusCancelled {
			return ErrActivityNotFound
		}
		if activity.HostUserID == userID {
			return errors.New("主办方不能通过此接口退出自己创建的活动")
		}

		if err := repo.UpdateParticipantStatus(ctx, activityID, userID, model.ParticipantStatusCancelled); err != nil {
			return err
		}

		counts, err := repo.CountParticipants(ctx, []uint{activityID})
		if err != nil {
			return err
		}
		current := counts[activityID]
		if participant.Status == model.ParticipantStatusRegistered && current.Registered > 0 {
			current.Registered--
		}
		if participant.Status == model.ParticipantStatusWaitlisted && current.Waitlisted > 0 {
			current.Waitlisted--
		}

		if participant.Status == model.ParticipantStatusRegistered {
			if err := s.promoteWaitlistedParticipant(ctx, repo, activityID, &current); err != nil {
				return err
			}
		}

		nextStatus := assembler.DeriveActivityStatus(*activity, current)
		if nextStatus != activity.Status {
			if err := repo.UpdateStatus(ctx, activityID, nextStatus); err != nil {
				return err
			}
		}

		return nil
	})
}

func (s *activityService) CancelActivity(ctx context.Context, userID, activityID uint) error {
	return s.activityRepo.WithTx(ctx, func(repo repository.ActivityRepository) error {
		activity, err := repo.LockByID(ctx, activityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrActivityNotFound
		}
		if err != nil {
			return err
		}

		if activity.HostUserID != userID {
			return ErrActivityNotHost
		}
		if activity.Status == model.ActivityStatusCancelled {
			return nil
		}

		if err := repo.UpdateStatus(ctx, activityID, model.ActivityStatusCancelled); err != nil {
			return err
		}

		return repo.CancelParticipantsByActivity(ctx, activityID)
	})
}

func parseActivityDateTime(dateValue, timeValue string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02 15:04", dateValue+" "+timeValue, time.Local)
}

func parseFeeAmount(raw string) (float64, error) {
	if strings.TrimSpace(raw) == "" {
		return 0, nil
	}

	amount, err := strconv.ParseFloat(strings.TrimSpace(raw), 64)
	if err != nil {
		return 0, errors.New("费用金额格式不正确")
	}
	if amount < 0 {
		return 0, errors.New("费用金额不能小于 0")
	}

	return amount, nil
}

func toSportLabel(sportCode string) string {
	switch sportCode {
	case "running":
		return "跑步"
	case "basketball":
		return "篮球"
	default:
		return "羽毛球"
	}
}

func joinRuleLabel(joinRule string) string {
	if joinRule == "approval_required" {
		return "报名需审核"
	}
	return "直接报名"
}

func visibilityLabel(visibility string) string {
	if visibility == "invite_only" {
		return "仅邀约可见"
	}
	return "公开可见"
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func (s *activityService) promoteWaitlistedParticipant(
	ctx context.Context,
	repo repository.ActivityRepository,
	activityID uint,
	current *repository.ParticipantCounters,
) error {
	waitlistedParticipant, err := repo.FindFirstWaitlistedParticipant(ctx, activityID)
	if err != nil {
		return err
	}
	if waitlistedParticipant == nil {
		return nil
	}

	if err := repo.UpdateParticipantStatus(
		ctx,
		activityID,
		waitlistedParticipant.UserID,
		model.ParticipantStatusRegistered,
	); err != nil {
		return err
	}

	current.Registered++
	if current.Waitlisted > 0 {
		current.Waitlisted--
	}

	return nil
}
