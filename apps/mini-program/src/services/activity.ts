import type {
  CreateActivityFormDraft,
  ExperienceActivity,
  ExperienceActivityDetail,
  MyActivityItem,
} from "@usport/shared";

import { request } from "../utils/helpers";
import type { ApiResponse } from "../types/api";

interface RegisterActivityResult {
  status: "registered" | "waitlisted";
  participantSummary: string;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) {
    throw new Error(response.message || "请求失败");
  }

  return response.data;
}

export const activityApi = {
  async list(): Promise<ExperienceActivity[]> {
    return unwrapResponse(
      await request.get<ExperienceActivity[]>("/activities"),
    );
  },

  async detail(id: string | number): Promise<ExperienceActivityDetail> {
    return unwrapResponse(
      await request.get<ExperienceActivityDetail>(`/activities/${id}`),
    );
  },

  async create(
    payload: CreateActivityFormDraft,
  ): Promise<ExperienceActivityDetail> {
    return unwrapResponse(
      await request.post<ExperienceActivityDetail>("/activities", payload),
    );
  },

  async mine(
    role: "all" | "host" | "participant" = "all",
  ): Promise<MyActivityItem[]> {
    return unwrapResponse(
      await request.get<MyActivityItem[]>("/activities/mine", undefined, {
        role,
      }),
    );
  },

  async register(id: string | number): Promise<RegisterActivityResult> {
    return unwrapResponse(
      await request.post<RegisterActivityResult>(`/activities/${id}/register`),
    );
  },

  async checkIn(id: string | number): Promise<{ checkedIn: boolean }> {
    return unwrapResponse(
      await request.post<{ checkedIn: boolean }>(`/activities/${id}/check-in`),
    );
  },

  async finish(id: string | number): Promise<{ finished: boolean }> {
    return unwrapResponse(
      await request.post<{ finished: boolean }>(`/activities/${id}/finish`),
    );
  },

  async cancelRegistration(
    id: string | number,
  ): Promise<{ cancelled: boolean }> {
    return unwrapResponse(
      await request.post<{ cancelled: boolean }>(
        `/activities/${id}/cancel-registration`,
      ),
    );
  },

  async cancelActivity(id: string | number): Promise<{ cancelled: boolean }> {
    return unwrapResponse(
      await request.post<{ cancelled: boolean }>(`/activities/${id}/cancel`),
    );
  },
};
