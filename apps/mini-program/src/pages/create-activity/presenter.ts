import type {
  CreateActivityFormDraft,
  CreateActivityOption,
} from "@usport/shared";
import {
  createActivityDistrictOptions,
  createActivityFeeOptions,
  createActivityJoinRuleOptions,
  createActivitySportOptions,
  createActivityVisibilityOptions,
} from "@usport/shared";

export interface CreateActivityFieldErrors {
  title: string;
  description: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  deadlineTime: string;
  feeAmount: string;
}

export interface CreateActivityPageState {
  draft: CreateActivityFormDraft;
  sportOptions: CreateActivityOption[];
  districtOptions: CreateActivityOption[];
  feeOptions: CreateActivityOption[];
  joinRuleOptions: CreateActivityOption[];
  visibilityOptions: CreateActivityOption[];
  fieldErrors: CreateActivityFieldErrors;
  feeAmountVisible: boolean;
  previewTitle: string;
  previewMeta: string;
  previewFee: string;
  riskHint: string;
}

export interface CreateActivityValidationResult {
  isValid: boolean;
  fieldErrors: CreateActivityFieldErrors;
  firstError: string;
}

const emptyErrors: CreateActivityFieldErrors = {
  title: "",
  description: "",
  venueName: "",
  date: "",
  startTime: "",
  endTime: "",
  deadlineTime: "",
  feeAmount: "",
};

function buildFeePreview(draft: CreateActivityFormDraft): string {
  if (draft.feeType === "free") {
    return "\u514d\u8d39\u53c2\u4e0e";
  }

  if (draft.feeType === "aa") {
    return "AA \u5206\u644a";
  }

  return `\u56fa\u5b9a\u8d39\u7528 ${draft.feeAmount || "0"} \u5143`;
}

function buildRiskHint(draft: CreateActivityFormDraft): string {
  const largeGroup = draft.capacity >= 12;
  const weekendNight =
    draft.startTime >= "19:00" &&
    (draft.date.endsWith("5") || draft.date.endsWith("6"));

  if (largeGroup && weekendNight) {
    return "\u4f60\u9009\u62e9\u7684\u662f\u70ed\u95e8\u65f6\u6bb5 + \u8f83\u5927\u4eba\u6570\uff0c\u5efa\u8bae\u5c3d\u5feb\u9080\u8bf7\u9996\u6279\u9ad8\u610f\u5411\u7528\u6237\uff0c\u907f\u514d\u4e34\u8fd1\u5f00\u573a\u4eba\u6570\u6ce2\u52a8\u3002";
  }

  if (draft.feeType === "fixed_price" && Number(draft.feeAmount || "0") > 120) {
    return "\u56fa\u5b9a\u8d39\u7528\u8f83\u9ad8\uff0c\u5efa\u8bae\u5728\u63cf\u8ff0\u91cc\u5199\u6e05\u695a\u662f\u5426\u5305\u542b\u6559\u7ec3\u3001\u88c5\u5907\u6216\u6258\u5e95\u670d\u52a1\u3002";
  }

  return "";
}

export function buildCreateActivityPageState(
  draft: CreateActivityFormDraft,
  fieldErrors: CreateActivityFieldErrors = emptyErrors,
): CreateActivityPageState {
  return {
    draft,
    sportOptions: createActivitySportOptions,
    districtOptions: createActivityDistrictOptions,
    feeOptions: createActivityFeeOptions,
    joinRuleOptions: createActivityJoinRuleOptions,
    visibilityOptions: createActivityVisibilityOptions,
    fieldErrors,
    feeAmountVisible: draft.feeType === "fixed_price",
    previewTitle:
      draft.title ||
      "\u7ed9\u8fd9\u573a\u6d3b\u52a8\u8d77\u4e00\u4e2a\u80fd\u8ba9\u4eba\u7acb\u523b\u7406\u89e3\u7684\u6807\u9898",
    previewMeta: `${draft.date} · ${draft.startTime} - ${draft.endTime} · ${draft.district}`,
    previewFee: `${buildFeePreview(draft)} · \u4e0a\u9650 ${draft.capacity} \u4eba`,
    riskHint: buildRiskHint(draft),
  };
}

export function validateCreateActivityDraft(
  draft: CreateActivityFormDraft,
): CreateActivityValidationResult {
  const fieldErrors: CreateActivityFieldErrors = { ...emptyErrors };

  if (draft.title.trim().length < 6) {
    fieldErrors.title =
      "\u6807\u9898\u81f3\u5c11\u9700\u8981 6 \u4e2a\u5b57\uff0c\u5efa\u8bae\u8bb2\u6e05\u65f6\u95f4\u3001\u4eba\u7fa4\u6216\u4eae\u70b9\u3002";
  }

  if (draft.description.trim().length > 300) {
    fieldErrors.description =
      "\u6d3b\u52a8\u63cf\u8ff0\u8bf7\u63a7\u5236\u5728 300 \u5b57\u4ee5\u5185\u3002";
  }

  if (!draft.venueName.trim()) {
    fieldErrors.venueName =
      "\u8bf7\u586b\u5199\u6d3b\u52a8\u573a\u9986\u6216\u96c6\u5408\u5730\u70b9\u3002";
  }

  if (!draft.date) {
    fieldErrors.date = "\u8bf7\u9009\u62e9\u6d3b\u52a8\u65e5\u671f\u3002";
  }

  if (!draft.startTime) {
    fieldErrors.startTime = "\u8bf7\u9009\u62e9\u5f00\u59cb\u65f6\u95f4\u3002";
  }

  if (!draft.endTime) {
    fieldErrors.endTime = "\u8bf7\u9009\u62e9\u7ed3\u675f\u65f6\u95f4\u3002";
  }

  if (!draft.deadlineTime) {
    fieldErrors.deadlineTime =
      "\u8bf7\u9009\u62e9\u62a5\u540d\u622a\u6b62\u65f6\u95f4\u3002";
  }

  if (draft.endTime && draft.startTime && draft.endTime <= draft.startTime) {
    fieldErrors.endTime =
      "\u7ed3\u675f\u65f6\u95f4\u5fc5\u987b\u665a\u4e8e\u5f00\u59cb\u65f6\u95f4\u3002";
  }

  if (
    draft.deadlineTime &&
    draft.startTime &&
    draft.deadlineTime >= draft.startTime
  ) {
    fieldErrors.deadlineTime =
      "\u62a5\u540d\u622a\u6b62\u65f6\u95f4\u5fc5\u987b\u65e9\u4e8e\u5f00\u59cb\u65f6\u95f4\u3002";
  }

  if (draft.feeType === "fixed_price" && !draft.feeAmount.trim()) {
    fieldErrors.feeAmount =
      "\u56fa\u5b9a\u8d39\u7528\u6a21\u5f0f\u4e0b\u5fc5\u987b\u586b\u5199\u91d1\u989d\u3002";
  }

  const firstError =
    Object.values(fieldErrors).find((message) => Boolean(message)) ?? "";

  return {
    isValid: !firstError,
    fieldErrors,
    firstError,
  };
}
