import type {
  CreateActivityFormDraft,
  CreateActivityOption,
  ExperienceActivityDetail,
} from "../types";

export const createActivitySportOptions: CreateActivityOption[] = [
  {
    value: "badminton",
    label: "\u7fbd\u6bdb\u7403",
    description: "\u9002\u5408\u4e0b\u73ed\u540e\u5feb\u901f\u6210\u5c40\u3002",
  },
  {
    value: "running",
    label: "\u8dd1\u6b65",
    description: "\u4f4e\u95e8\u69db\u3001\u590d\u7ea6\u7387\u9ad8\u3002",
  },
  {
    value: "basketball",
    label: "\u7bee\u7403",
    description: "\u5bf9\u4eba\u6570\u548c\u573a\u5730\u66f4\u654f\u611f\u3002",
  },
];

export const createActivityDistrictOptions: CreateActivityOption[] = [
  {
    value: "\u6d66\u4e1c\u65b0\u533a",
    label: "\u6d66\u4e1c\u65b0\u533a",
    description: "\u5de5\u4f5c\u65e5\u665a\u95f4\u9700\u6c42\u6700\u5f3a\u3002",
  },
  {
    value: "\u5f90\u6c47\u533a",
    label: "\u5f90\u6c47\u533a",
    description: "\u8dd1\u6b65\u548c\u8f7b\u793e\u4ea4\u6d3b\u8dc3\u3002",
  },
  {
    value: "\u957f\u5b81\u533a",
    label: "\u957f\u5b81\u533a",
    description:
      "\u4e0b\u73ed\u5feb\u5c40\u548c\u719f\u4eba\u590d\u7ea6\u7a33\u5b9a\u3002",
  },
];

export const createActivityFeeOptions: CreateActivityOption[] = [
  {
    value: "free",
    label: "\u514d\u8d39",
    description: "\u9002\u5408\u7834\u51b0\u548c\u5c1d\u8bd5\u5c40\u3002",
  },
  {
    value: "aa",
    label: "AA",
    description: "\u6700\u9002\u5408\u573a\u9986\u7c7b\u6d3b\u52a8\u3002",
  },
  {
    value: "fixed_price",
    label: "\u56fa\u5b9a\u8d39\u7528",
    description:
      "\u9002\u5408\u542b\u6559\u7ec3\u6216\u6258\u5e95\u670d\u52a1\u3002",
  },
];

export const createActivityJoinRuleOptions: CreateActivityOption[] = [
  {
    value: "direct",
    label: "\u76f4\u63a5\u62a5\u540d",
    description: "\u94fe\u8def\u66f4\u77ed\uff0c\u8f6c\u5316\u66f4\u9ad8\u3002",
  },
  {
    value: "approval_required",
    label: "\u9700\u8981\u5ba1\u6838",
    description: "\u9002\u5408\u6709\u95e8\u69db\u7684\u5c40\u3002",
  },
];

export const createActivityVisibilityOptions: CreateActivityOption[] = [
  {
    value: "public",
    label: "\u516c\u5f00\u53ef\u89c1",
    description: "\u4f1a\u8fdb\u5165\u53d1\u73b0\u9875\u63a8\u8350\u3002",
  },
  {
    value: "invite_only",
    label: "\u4ec5\u9080\u7ea6\u53ef\u89c1",
    description:
      "\u9002\u5408\u719f\u4eba\u5c40\u6216\u9ad8\u95e8\u69db\u5c40\u3002",
  },
];

const activityDetails: ExperienceActivityDetail[] = [
  {
    id: "1001",
    sourceActivityId: 1001,
    title: "\u4eca\u665a 8 \u4eba\u7fbd\u6bdb\u7403\u53cb\u597d\u5c40",
    sportCode: "badminton",
    sportLabel: "\u7fbd\u6bdb\u7403",
    status: "published",
    statusTone: {
      label: "\u62a5\u540d\u4e2d",
      tone: "success",
    },
    riskHint:
      "\u5b98\u65b9\u6258\u5e95\u6210\u5c40\uff0c\u82e5\u4eba\u6570\u6ce2\u52a8\u4f1a\u4f18\u5148\u8865\u4f4d\u3002",
    coverLabel: "\u6d66\u4e1c\u591c\u573a \u00b7 \u53cb\u597d\u6210\u5c40",
    subtitle:
      "\u9002\u5408\u4e2d\u7ea7\u5230\u8fdb\u9636\u6c34\u5e73\uff0c\u4e0b\u73ed\u540e\u76f4\u63a5\u6765\u6253\u3002",
    startTimeLabel: "\u4eca\u5929 19:30",
    endTimeLabel: "\u4eca\u5929 21:30",
    signupDeadlineLabel: "\u4eca\u5929 18:50 \u622a\u6b62",
    district: "\u4e0a\u6d77 \u00b7 \u6d66\u4e1c\u65b0\u533a",
    venueName: "\u6e90\u6df1\u4f53\u80b2\u9986 3 \u53f7\u573a",
    addressHint:
      "\u8ddd\u79bb\u5730\u94c1\u53e3\u6b65\u884c\u7ea6 300 \u7c73\u3002",
    participantSummary:
      "\u5df2\u786e\u8ba4 6 / 8 \u4eba\uff0c\u53ef\u5019\u8865 2 \u4eba",
    feeLabel:
      "AA \u7ea6 48 \u5143\uff0c\u73b0\u573a\u5230\u9f50\u540e\u5206\u644a",
    host: {
      name: "Jasper",
      badge: "\u5b9e\u540d\u8ba4\u8bc1\u4e3b\u529e\u65b9",
      attendanceLabel: "\u8fd1 30 \u5929\u5230\u573a\u7387 96%",
      recentSessionsLabel:
        "\u6700\u8fd1 14 \u5929\u7ec4\u5c40 5 \u573a\uff0c4 \u573a\u6ee1\u5458",
    },
    description:
      "\u8fd9\u662f\u4e00\u573a\u4ee5\u7a33\u5b9a\u6210\u5c40\u4e3a\u7b2c\u4e00\u76ee\u6807\u7684\u4e0b\u73ed\u5c40\uff0c\u5355\u4eba\u4e5f\u80fd\u8f7b\u677e\u52a0\u5165\u3002",
    suitableCrowd: [
      "\u4e2d\u7ea7\u53cb\u597d",
      "\u5355\u4eba\u53ef\u62a5",
      "\u5973\u751f\u53cb\u597d",
    ],
    skillLevelLabel:
      "\u5efa\u8bae\u4e2d\u7ea7\u53ca\u4ee5\u4e0a\uff0c\u4e5f\u53ef\u5e26\u65b0\u624b\u4f53\u9a8c",
    genderRuleLabel: "\u4e0d\u9650\u6027\u522b",
    notices: [
      "\u5efa\u8bae\u63d0\u524d 15 \u5206\u949f\u5230\u573a\u70ed\u8eab\u3002",
      "\u82e5\u4e34\u65f6\u65e0\u6cd5\u53c2\u52a0\uff0c\u8bf7\u5728\u622a\u6b62\u524d\u53d6\u6d88\u3002",
      "\u6d3b\u52a8\u7ed3\u675f\u540e\u53ef\u7ee7\u7eed\u52a0\u5165\u540c\u57ce\u590d\u7ea6\u7fa4\u3002",
    ],
    allowWaitlist: true,
    shareSummary:
      "\u4eca\u665a\u5c31\u80fd\u6210\u5c40\u7684\u7fbd\u6bdb\u7403\u53cb\u597d\u5c40\u3002",
  },
  {
    id: "1002",
    sourceActivityId: 1002,
    title:
      "\u5468\u516d\u6e05\u6668\u6ee8\u6c5f 8 \u516c\u91cc\u914d\u901f\u8dd1",
    sportCode: "running",
    sportLabel: "\u8dd1\u6b65",
    status: "published",
    statusTone: {
      label: "\u4ecd\u53ef\u52a0\u5165",
      tone: "success",
    },
    coverLabel:
      "\u5f90\u6c47\u6ee8\u6c5f \u00b7 \u8f7b\u793e\u4ea4\u6668\u8dd1",
    subtitle:
      "\u56fa\u5b9a\u914d\u901f\u5e26\u961f\uff0c\u8dd1\u540e\u4e00\u8d77\u65e9\u9910\u3002",
    startTimeLabel: "\u5468\u516d 07:15",
    endTimeLabel: "\u5468\u516d 08:30",
    signupDeadlineLabel: "\u5468\u516d 06:30 \u622a\u6b62",
    district: "\u4e0a\u6d77 \u00b7 \u5f90\u6c47\u533a",
    venueName: "\u9f99\u7f8e\u672f\u9986\u96c6\u5408\u70b9",
    addressHint:
      "\u516c\u5f00\u96c6\u5408\u70b9\u660e\u786e\uff0c\u8def\u7ebf\u6cbf\u6c5f\u3002",
    participantSummary: "\u5df2\u786e\u8ba4 12 / 18 \u4eba",
    feeLabel:
      "\u514d\u8d39\u53c2\u4e0e\uff0c\u53ef\u81ea\u9009\u8dd1\u540e\u8865\u7ed9",
    host: {
      name: "Mia",
      badge: "\u9ad8\u590d\u7ea6\u9886\u8dd1",
      attendanceLabel: "\u8fd1 30 \u5929\u5230\u573a\u7387 94%",
      recentSessionsLabel:
        "\u8fde\u7eed 3 \u5468\u6210\u5c40\uff0c\u5e73\u5747\u590d\u7ea6\u7387 64%",
    },
    description:
      "\u56fa\u5b9a\u914d\u901f\u8dd1\u56e2\uff0c\u9002\u5408\u60f3\u6301\u7eed\u4fdd\u6301\u9891\u7387\u7684\u4eba\u7fa4\u3002",
    suitableCrowd: [
      "\u6668\u8dd1\u4e60\u60ef\u8005",
      "\u8f7b\u793e\u4ea4",
      "\u957f\u671f\u590d\u7ea6",
    ],
    skillLevelLabel: "\u5efa\u8bae\u914d\u901f 5'50 - 6'30",
    genderRuleLabel: "\u4e0d\u9650\u6027\u522b",
    notices: [
      "\u9047\u96e8\u4f1a\u5728\u524d\u4e00\u665a\u7ed9\u51fa\u8c03\u6574\u901a\u77e5\u3002",
      "\u8bf7\u6309\u5b9e\u9645\u72b6\u6001\u9009\u62e9\u914d\u901f\u7ec4\u3002",
    ],
    allowWaitlist: false,
    shareSummary:
      "\u9002\u5408\u957f\u671f\u590d\u7ea6\u7684\u6ee8\u6c5f\u6668\u8dd1\u5c40\u3002",
  },
  {
    id: "1003",
    sourceActivityId: 1003,
    title: "\u5468\u4e94\u4e0b\u73ed\u7bee\u7403\u534a\u573a\u5feb\u5c40",
    sportCode: "basketball",
    sportLabel: "\u7bee\u7403",
    status: "full",
    statusTone: {
      label: "\u540d\u989d\u7d27\u5f20",
      tone: "warning",
    },
    riskHint:
      "\u5f53\u524d\u5df2\u63a5\u8fd1\u6ee1\u5458\uff0c\u82e5\u6709\u4eba\u53d6\u6d88\u5c06\u4f18\u5148\u6309\u5019\u8865\u987a\u5e8f\u8865\u5165\u3002",
    coverLabel: "\u957f\u5b81\u591c\u573a \u00b7 \u534a\u573a\u5feb\u5c40",
    subtitle:
      "\u9002\u5408\u4e0b\u73ed\u76f4\u63a5\u6765\u6253\u7684 90 \u5206\u949f\u5feb\u5c40\u3002",
    startTimeLabel: "\u5468\u4e94 20:00",
    endTimeLabel: "\u5468\u4e94 21:30",
    signupDeadlineLabel: "\u5468\u4e94 18:30 \u622a\u6b62",
    district: "\u4e0a\u6d77 \u00b7 \u957f\u5b81\u533a",
    venueName: "\u5929\u5c71\u8def\u793e\u533a\u7403\u573a",
    addressHint:
      "\u5de5\u4f5c\u65e5\u665a\u9ad8\u5cf0\u53ef\u8fbe\u6027\u8f83\u597d\u3002",
    participantSummary:
      "\u5df2\u786e\u8ba4 9 / 10 \u4eba\uff0c\u53ef\u5019\u8865 3 \u4eba",
    feeLabel:
      "\u514d\u8d39\u53c2\u4e0e\uff0c\u81ea\u5e26\u6c34\u548c\u62a4\u5177",
    host: {
      name: "Leo",
      badge: "\u6d3b\u8dc3\u4e3b\u529e\u65b9",
      attendanceLabel: "\u8fd1 30 \u5929\u5230\u573a\u7387 89%",
      recentSessionsLabel: "\u6700\u8fd1 10 \u573a\u4e2d 7 \u573a\u6ee1\u5458",
    },
    description:
      "\u4e3b\u6253\u5de5\u4f5c\u65e5\u665a\u95f4\u5feb\u5f00\u5feb\u6253\uff0c\u9002\u5408\u9ad8\u9891\u6253\u7403\u4eba\u7fa4\u3002",
    suitableCrowd: [
      "\u4e0b\u73ed\u5feb\u5c40",
      "\u534a\u573a\u8f6e\u8f6c",
      "\u4e2d\u9ad8\u5f3a\u5ea6",
    ],
    skillLevelLabel: "\u5efa\u8bae\u6709\u57fa\u7840\u7bee\u7403\u7ecf\u9a8c",
    genderRuleLabel: "\u4e0d\u9650\u6027\u522b",
    notices: [
      "\u6d3b\u52a8\u5df2\u63a5\u8fd1\u6ee1\u5458\uff0c\u5efa\u8bae\u5148\u5019\u8865\u3002",
      "\u8bf7\u81ea\u5907\u62a4\u819d\u3001\u62a4\u8e1d\u7b49\u57fa\u7840\u88c5\u5907\u3002",
    ],
    allowWaitlist: true,
    shareSummary:
      "\u5de5\u4f5c\u65e5\u665a\u95f4\u534a\u573a\u5feb\u5c40\u3002",
  },
];

export function getExperienceActivityDetail(
  activityId: string | number,
): ExperienceActivityDetail | null {
  const targetId = String(activityId);
  return activityDetails.find((item) => item.id === targetId) ?? null;
}

function getSportLabel(sportCode: string): string {
  return (
    createActivitySportOptions.find((item) => item.value === sportCode)
      ?.label ?? "\u8fd0\u52a8"
  );
}

function formatDateLabel(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  return `${year} \u5e74 ${month} \u6708 ${day} \u65e5 ${time}`;
}

function buildFeeLabel(draft: CreateActivityFormDraft): string {
  if (draft.feeType === "free") {
    return "\u514d\u8d39\u53c2\u4e0e";
  }

  if (draft.feeType === "aa") {
    return "AA \u5206\u644a\uff0c\u73b0\u573a\u6309\u5b9e\u9645\u6210\u672c\u7ed3\u7b97";
  }

  return `\u56fa\u5b9a\u8d39\u7528 ${draft.feeAmount || "0"} \u5143`;
}

export function buildCreatedActivityDetail(
  draft: CreateActivityFormDraft,
  hostName: string = "\u4f60",
): ExperienceActivityDetail {
  const sportLabel = getSportLabel(draft.sportCode);

  return {
    id: "created",
    title: draft.title,
    sportCode: draft.sportCode,
    sportLabel,
    status: "published",
    statusTone: {
      label: "\u5df2\u53d1\u5e03",
      tone: "success",
    },
    coverLabel: `${draft.district} \u00b7 \u65b0\u53d1\u5e03\u6d3b\u52a8`,
    subtitle:
      draft.description.trim() ||
      "\u4f60\u521a\u521a\u53d1\u5e03\u4e86\u4e00\u573a\u65b0\u6d3b\u52a8\uff0c\u73b0\u5728\u53ef\u4ee5\u7ee7\u7eed\u9080\u8bf7\u5408\u9002\u7684\u4eba\u4e00\u8d77\u6210\u5c40\u3002",
    startTimeLabel: formatDateLabel(draft.date, draft.startTime),
    endTimeLabel: formatDateLabel(draft.date, draft.endTime),
    signupDeadlineLabel: formatDateLabel(draft.date, draft.deadlineTime),
    district: `\u4e0a\u6d77 \u00b7 ${draft.district}`,
    venueName: draft.venueName,
    addressHint:
      "\u5df2\u6309\u4f60\u586b\u5199\u7684\u573a\u9986\u4fe1\u606f\u521b\u5efa\uff0c\u53ef\u5728\u540e\u7eed\u8865\u5145\u8be6\u7ec6\u8def\u7ebf\u3002",
    participantSummary: `\u5df2\u786e\u8ba4 1 / ${draft.capacity} \u4eba\uff0c\u53ef\u5019\u8865 ${draft.waitlistCapacity} \u4eba`,
    feeLabel: buildFeeLabel(draft),
    host: {
      name: hostName,
      badge: "\u65b0\u53d1\u5e03\u4e3b\u529e\u65b9",
      attendanceLabel:
        "\u5b8c\u6210\u9996\u573a\u540e\u5c06\u5f00\u59cb\u7d2f\u8ba1\u5230\u573a\u8bb0\u5f55",
      recentSessionsLabel:
        "\u8fd9\u662f\u4f60\u7684\u6700\u65b0\u53d1\u5e03\u6d3b\u52a8",
    },
    description:
      draft.description.trim() ||
      "\u6d3b\u52a8\u521a\u521a\u521b\u5efa\u5b8c\u6210\uff0c\u5efa\u8bae\u5c3d\u5feb\u9080\u8bf7\u9996\u6279\u9ad8\u610f\u5411\u7528\u6237\u3002",
    suitableCrowd: [
      draft.joinRule === "direct"
        ? "\u76f4\u63a5\u62a5\u540d"
        : "\u62a5\u540d\u9700\u5ba1\u6838",
      draft.visibility === "public"
        ? "\u516c\u5f00\u53ef\u89c1"
        : "\u4ec5\u9080\u7ea6\u53ef\u89c1",
      "\u65b0\u53d1\u5e03",
    ],
    skillLevelLabel:
      "\u9ed8\u8ba4\u5bf9\u5916\u516c\u5f00\uff0c\u53ef\u5728\u540e\u7eed\u7248\u672c\u8865\u5145\u66f4\u7ec6\u95e8\u69db",
    genderRuleLabel: "\u4e0d\u9650\u6027\u522b",
    notices: [
      "\u53d1\u5e03\u540e\u5efa\u8bae\u5148\u9080\u8bf7 3 \u5230 5 \u4f4d\u9ad8\u610f\u5411\u7528\u6237\u3002",
      "\u5982\u9700\u6258\u5e95\u6210\u5c40\uff0c\u53ef\u5728\u540e\u7eed\u7248\u672c\u7533\u8bf7\u5b98\u65b9\u534f\u52a9\u3002",
    ],
    allowWaitlist: draft.waitlistCapacity > 0,
    shareSummary: `${sportLabel}\u65b0\u6d3b\u52a8\u5df2\u53d1\u5e03\uff0c\u5feb\u9080\u8bf7\u5408\u9002\u7684\u4eba\u4e00\u8d77\u6210\u5c40\u3002`,
  };
}
