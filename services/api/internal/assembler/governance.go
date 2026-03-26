package assembler

import (
	"fmt"

	"github.com/usport/usport-api/dal/model"
	"github.com/usport/usport-api/internal/dto"
)

func ToReportItem(item model.Report) dto.ReportItem {
	return dto.ReportItem{
		ID:             item.ID,
		TargetType:     item.TargetType,
		TargetID:       item.TargetID,
		ReasonCode:     item.ReasonCode,
		Description:    item.Description,
		Status:         item.Status,
		StatusLabel:    mapReportStatusLabel(item.Status),
		CreatedAtLabel: item.CreatedAt.Format("01月02日 15:04"),
	}
}

func ToCreditItem(item model.CreditRecord) dto.CreditItem {
	return dto.CreditItem{
		ID:          item.ID,
		EventCode:   item.EventCode,
		Delta:       item.Delta,
		Label:       mapCreditEventLabel(item.EventCode),
		Description: item.Description,
		CreatedAt:   item.CreatedAt.Format("01月02日 15:04"),
	}
}

func BuildCreditSummary(items []model.CreditRecord) dto.CreditSummary {
	score := 100
	positiveCount := 0
	riskCount := 0
	recentRecords := make([]dto.CreditItem, 0, len(items))

	for _, item := range items {
		score += item.Delta
		if item.Delta >= 0 {
			positiveCount++
		} else {
			riskCount++
		}
		recentRecords = append(recentRecords, ToCreditItem(item))
	}

	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	return dto.CreditSummary{
		Score:                 score,
		LevelLabel:            mapCreditLevel(score),
		PositiveCount:         positiveCount,
		RiskCount:             riskCount,
		CompletionRate:        fmt.Sprintf("%d%%", max(60, 96-riskCount*8)),
		RecentRecords:         recentRecords,
		ImprovementSuggestion: buildCreditSuggestion(riskCount),
	}
}

func mapReportStatusLabel(status string) string {
	switch status {
	case model.ReportStatusInReview:
		return "审核中"
	case model.ReportStatusResolvedValid:
		return "已确认有效"
	case model.ReportStatusResolvedInvalid:
		return "已确认无效"
	case model.ReportStatusClosed:
		return "已关闭"
	default:
		return "待处理"
	}
}

func mapCreditEventLabel(code string) string {
	switch code {
	case model.CreditEventAttendanceStable:
		return "稳定到场"
	case model.CreditEventLateCancel:
		return "临时取消"
	case model.CreditEventNoShow:
		return "未到场"
	case model.CreditEventReportValid:
		return "举报成立"
	default:
		return "信用记录"
	}
}

func mapCreditLevel(score int) string {
	switch {
	case score >= 95:
		return "优秀履约"
	case score >= 85:
		return "稳定履约"
	case score >= 70:
		return "需要关注"
	default:
		return "高风险"
	}
}

func buildCreditSuggestion(riskCount int) string {
	if riskCount == 0 {
		return "继续保持稳定到场和低取消率，推荐曝光会更稳。"
	}
	if riskCount == 1 {
		return "接下来优先保持准时到场，信用会很快恢复。"
	}
	return "建议先减少临时取消和爽约，连续稳定履约会逐步修复信用。"
}
