import type {
  ActivitySignupStatus,
  CreateActivityFormDraft,
  ExperienceActivityDetail,
} from "@usport/shared";

import {
  getActivitySignupStatus,
  getLatestCreatedActivity,
  setActivitySignupStatus,
  setLatestCreatedActivity,
} from "../../utils/storage";

export function resolveActivityDetail(
  activityId: string,
  fallbackDetail: ExperienceActivityDetail | null,
): ExperienceActivityDetail | null {
  if (activityId === "created") {
    return getLatestCreatedActivity() ?? fallbackDetail;
  }

  return fallbackDetail;
}

export function saveCreatedActivity(detail: ExperienceActivityDetail): void {
  setLatestCreatedActivity(detail);
}

export function readSignupStatus(activityId: string): ActivitySignupStatus {
  return getActivitySignupStatus(activityId);
}

export function persistSignupStatus(
  activityId: string,
  status: ActivitySignupStatus,
): void {
  setActivitySignupStatus(activityId, status);
}

export function createDraftFromPartial(
  partialDraft?: Partial<CreateActivityFormDraft>,
): CreateActivityFormDraft {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  return {
    sportCode: partialDraft?.sportCode ?? "badminton",
    title: partialDraft?.title ?? "",
    description: partialDraft?.description ?? "",
    date,
    startTime: partialDraft?.startTime ?? "19:30",
    endTime: partialDraft?.endTime ?? "21:00",
    deadlineTime: partialDraft?.deadlineTime ?? "18:30",
    district: partialDraft?.district ?? "浦东新区",
    venueName: partialDraft?.venueName ?? "",
    capacity: partialDraft?.capacity ?? 8,
    waitlistCapacity: partialDraft?.waitlistCapacity ?? 2,
    feeType: partialDraft?.feeType ?? "aa",
    feeAmount: partialDraft?.feeAmount ?? "48",
    joinRule: partialDraft?.joinRule ?? "direct",
    visibility: partialDraft?.visibility ?? "public",
  };
}
