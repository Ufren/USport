import type {
  ActivitySignupStatus,
  ExperienceActivityDetail,
} from "@usport/shared";

export interface DetailInfoItem {
  id: string;
  label: string;
  value: string;
}

export interface DetailActionState {
  helperText: string;
  primaryLabel: string;
  primaryDisabled: boolean;
  secondaryLabel: string;
}

export interface ActivityDetailPageState {
  isEmpty: boolean;
  activityId: string;
  title: string;
  subtitle: string;
  coverLabel: string;
  statusLabel: string;
  statusClassName: string;
  riskHint: string;
  infoItems: DetailInfoItem[];
  hostInitial: string;
  hostName: string;
  hostBadge: string;
  hostAttendanceLabel: string;
  hostRecentSessionsLabel: string;
  suitableCrowd: string[];
  skillLevelLabel: string;
  genderRuleLabel: string;
  description: string;
  notices: string[];
  actionState: DetailActionState;
}

const toneClassMap = {
  success: "status-pill--success",
  warning: "status-pill--warning",
  neutral: "status-pill--neutral",
  danger: "status-pill--danger",
} as const;

function buildActionState(
  detail: ExperienceActivityDetail,
  signupStatus: ActivitySignupStatus,
  isLoggedIn: boolean,
): DetailActionState {
  if (detail.status === "cancelled") {
    return {
      helperText: "活动已取消，平台建议你查看同城其它可成局活动。",
      primaryLabel: "已取消",
      primaryDisabled: true,
      secondaryLabel: "返回发现",
    };
  }

  if (detail.status === "signup_closed") {
    return {
      helperText: "报名已经截止，你可以关注主办方后续新局。",
      primaryLabel: "已截止",
      primaryDisabled: true,
      secondaryLabel: "看看同类活动",
    };
  }

  if (signupStatus === "registered") {
    return {
      helperText: "你已报名成功，建议提前 15 分钟到场热身。",
      primaryLabel: "已报名",
      primaryDisabled: true,
      secondaryLabel: "分享活动",
    };
  }

  if (signupStatus === "waitlisted") {
    return {
      helperText: "你已进入候补队列，若有人退出会优先补位。",
      primaryLabel: "已候补",
      primaryDisabled: true,
      secondaryLabel: "分享活动",
    };
  }

  if (!isLoggedIn) {
    return {
      helperText: "登录后可一键报名，并沉淀你的履约记录。",
      primaryLabel: "登录后报名",
      primaryDisabled: false,
      secondaryLabel: "先看看",
    };
  }

  if (detail.status === "full") {
    return {
      helperText: detail.allowWaitlist
        ? "当前名额已满，你可以先候补等待补位。"
        : "当前名额已满，建议看看同类活动。",
      primaryLabel: detail.allowWaitlist ? "候补报名" : "已满员",
      primaryDisabled: !detail.allowWaitlist,
      secondaryLabel: "分享活动",
    };
  }

  return {
    helperText: "现在报名还能占住好时段，后续也更容易沉淀复约关系。",
    primaryLabel: "立即报名",
    primaryDisabled: false,
    secondaryLabel: "分享活动",
  };
}

export function buildActivityDetailPageState(
  detail: ExperienceActivityDetail | null,
  signupStatus: ActivitySignupStatus,
  isLoggedIn: boolean,
): ActivityDetailPageState {
  if (!detail) {
    return {
      isEmpty: true,
      activityId: "",
      title: "活动不存在",
      subtitle: "这场活动可能已下线，返回发现页继续看看其它可成局的局。",
      coverLabel: "USport",
      statusLabel: "待确认",
      statusClassName: toneClassMap.neutral,
      riskHint: "",
      infoItems: [],
      hostInitial: "",
      hostName: "",
      hostBadge: "",
      hostAttendanceLabel: "",
      hostRecentSessionsLabel: "",
      suitableCrowd: [],
      skillLevelLabel: "",
      genderRuleLabel: "",
      description: "",
      notices: [],
      actionState: {
        helperText: "返回发现页继续寻找同城运动局。",
        primaryLabel: "返回发现",
        primaryDisabled: false,
        secondaryLabel: "稍后再看",
      },
    };
  }

  return {
    isEmpty: false,
    activityId: detail.id,
    title: detail.title,
    subtitle: detail.subtitle,
    coverLabel: detail.coverLabel,
    statusLabel: detail.statusTone.label,
    statusClassName: toneClassMap[detail.statusTone.tone],
    riskHint: detail.riskHint ?? "",
    infoItems: [
      {
        id: "time",
        label: "活动时间",
        value: `${detail.startTimeLabel} - ${detail.endTimeLabel}`,
      },
      {
        id: "deadline",
        label: "报名截止",
        value: detail.signupDeadlineLabel,
      },
      {
        id: "venue",
        label: "场地位置",
        value: `${detail.district} · ${detail.venueName}`,
      },
      {
        id: "people",
        label: "人数情况",
        value: detail.participantSummary,
      },
      {
        id: "fee",
        label: "费用说明",
        value: detail.feeLabel,
      },
    ],
    hostInitial: detail.host.name.charAt(0).toUpperCase(),
    hostName: detail.host.name,
    hostBadge: detail.host.badge,
    hostAttendanceLabel: detail.host.attendanceLabel,
    hostRecentSessionsLabel: detail.host.recentSessionsLabel,
    suitableCrowd: detail.suitableCrowd,
    skillLevelLabel: detail.skillLevelLabel,
    genderRuleLabel: detail.genderRuleLabel,
    description: detail.description,
    notices: detail.notices,
    actionState: buildActionState(detail, signupStatus, isLoggedIn),
  };
}
