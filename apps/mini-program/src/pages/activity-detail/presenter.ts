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
  if (signupStatus === "registered") {
    return {
      helperText:
        "\u4f60\u5df2\u62a5\u540d\u6210\u529f\uff0c\u5efa\u8bae\u63d0\u524d 15 \u5206\u949f\u5230\u573a\u70ed\u8eab\u3002",
      primaryLabel: "\u5df2\u62a5\u540d",
      primaryDisabled: true,
      secondaryLabel: "\u5206\u4eab\u6d3b\u52a8",
    };
  }

  if (signupStatus === "waitlisted") {
    return {
      helperText:
        "\u4f60\u5df2\u8fdb\u5165\u5019\u8865\u961f\u5217\uff0c\u82e5\u6709\u4eba\u9000\u51fa\u4f1a\u4f18\u5148\u8865\u4f4d\u3002",
      primaryLabel: "\u5df2\u5019\u8865",
      primaryDisabled: true,
      secondaryLabel: "\u5206\u4eab\u6d3b\u52a8",
    };
  }

  if (!isLoggedIn) {
    return {
      helperText:
        "\u767b\u5f55\u540e\u53ef\u4e00\u952e\u62a5\u540d\uff0c\u5e76\u6c89\u6dc0\u4f60\u7684\u5c65\u7ea6\u8bb0\u5f55\u3002",
      primaryLabel: "\u767b\u5f55\u540e\u62a5\u540d",
      primaryDisabled: false,
      secondaryLabel: "\u5148\u770b\u770b",
    };
  }

  if (detail.status === "full") {
    return {
      helperText: detail.allowWaitlist
        ? "\u5f53\u524d\u540d\u989d\u5df2\u6ee1\uff0c\u4f60\u53ef\u4ee5\u5148\u5019\u8865\u7b49\u5f85\u8865\u4f4d\u3002"
        : "\u5f53\u524d\u540d\u989d\u5df2\u6ee1\uff0c\u5efa\u8bae\u770b\u770b\u540c\u7c7b\u6d3b\u52a8\u3002",
      primaryLabel: detail.allowWaitlist
        ? "\u5019\u8865\u62a5\u540d"
        : "\u5df2\u6ee1\u5458",
      primaryDisabled: !detail.allowWaitlist,
      secondaryLabel: "\u5206\u4eab\u6d3b\u52a8",
    };
  }

  if (detail.status === "signup_closed") {
    return {
      helperText:
        "\u62a5\u540d\u5df2\u7ecf\u622a\u6b62\uff0c\u4f60\u53ef\u4ee5\u5173\u6ce8\u4e3b\u529e\u65b9\u540e\u7eed\u65b0\u5c40\u3002",
      primaryLabel: "\u5df2\u622a\u6b62",
      primaryDisabled: true,
      secondaryLabel: "\u770b\u770b\u540c\u7c7b\u6d3b\u52a8",
    };
  }

  if (detail.status === "cancelled") {
    return {
      helperText:
        "\u6d3b\u52a8\u5df2\u53d6\u6d88\uff0c\u5e73\u53f0\u5efa\u8bae\u4f60\u67e5\u770b\u540c\u57ce\u5176\u5b83\u53ef\u6210\u5c40\u6d3b\u52a8\u3002",
      primaryLabel: "\u5df2\u53d6\u6d88",
      primaryDisabled: true,
      secondaryLabel: "\u8fd4\u56de\u53d1\u73b0",
    };
  }

  return {
    helperText:
      "\u73b0\u5728\u62a5\u540d\u8fd8\u80fd\u5360\u4f4f\u597d\u65f6\u6bb5\uff0c\u540e\u7eed\u4e5f\u66f4\u5bb9\u6613\u6c89\u6dc0\u590d\u7ea6\u5173\u7cfb\u3002",
    primaryLabel: "\u7acb\u5373\u62a5\u540d",
    primaryDisabled: false,
    secondaryLabel: "\u5206\u4eab\u6d3b\u52a8",
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
      title: "\u6d3b\u52a8\u4e0d\u5b58\u5728",
      subtitle:
        "\u8fd9\u573a\u6d3b\u52a8\u53ef\u80fd\u5df2\u4e0b\u7ebf\uff0c\u8fd4\u56de\u53d1\u73b0\u9875\u7ee7\u7eed\u770b\u770b\u5176\u5b83\u53ef\u6210\u5c40\u7684\u5c40\u3002",
      coverLabel: "USport",
      statusLabel: "\u5f85\u786e\u8ba4",
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
        helperText:
          "\u8fd4\u56de\u53d1\u73b0\u9875\u7ee7\u7eed\u5bfb\u627e\u540c\u57ce\u8fd0\u52a8\u5c40\u3002",
        primaryLabel: "\u8fd4\u56de\u53d1\u73b0",
        primaryDisabled: false,
        secondaryLabel: "\u7a0d\u540e\u518d\u770b",
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
        label: "\u6d3b\u52a8\u65f6\u95f4",
        value: `${detail.startTimeLabel} - ${detail.endTimeLabel}`,
      },
      {
        id: "deadline",
        label: "\u62a5\u540d\u622a\u6b62",
        value: detail.signupDeadlineLabel,
      },
      {
        id: "venue",
        label: "\u573a\u5730\u4f4d\u7f6e",
        value: `${detail.district} · ${detail.venueName}`,
      },
      {
        id: "people",
        label: "\u4eba\u6570\u60c5\u51b5",
        value: detail.participantSummary,
      },
      {
        id: "fee",
        label: "\u8d39\u7528\u8bf4\u660e",
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
