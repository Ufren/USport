import type {
  CreateActivityFormDraft,
  ExperienceActivity,
  ExperienceActivityDetail,
  MyActivityItem,
} from "@usport/shared";

import { httpClient } from "../utils/http";

export interface RegisterActivityResult {
  status: "registered" | "waitlisted";
  participantSummary: string;
}

export const activityApi = {
  async list(): Promise<ExperienceActivity[]> {
    return httpClient.get<ExperienceActivity[]>("/activities");
  },

  async detail(id: string | number): Promise<ExperienceActivityDetail> {
    return httpClient.get<ExperienceActivityDetail>(`/activities/${id}`);
  },

  async create(
    payload: CreateActivityFormDraft,
  ): Promise<ExperienceActivityDetail> {
    return httpClient.post<ExperienceActivityDetail>("/activities", payload);
  },

  async mine(
    role: "all" | "host" | "participant" = "all",
  ): Promise<MyActivityItem[]> {
    return httpClient.get<MyActivityItem[]>("/activities/mine", { role });
  },

  async register(id: string | number): Promise<RegisterActivityResult> {
    return httpClient.post<RegisterActivityResult>(
      `/activities/${id}/register`,
    );
  },

  async checkIn(id: string | number): Promise<{ checkedIn: boolean }> {
    return httpClient.post<{ checkedIn: boolean }>(
      `/activities/${id}/check-in`,
    );
  },

  async finish(id: string | number): Promise<{ finished: boolean }> {
    return httpClient.post<{ finished: boolean }>(`/activities/${id}/finish`);
  },

  async cancelRegistration(
    id: string | number,
  ): Promise<{ cancelled: boolean }> {
    return httpClient.post<{ cancelled: boolean }>(
      `/activities/${id}/cancel-registration`,
    );
  },

  async cancelActivity(id: string | number): Promise<{ cancelled: boolean }> {
    return httpClient.post<{ cancelled: boolean }>(`/activities/${id}/cancel`);
  },
};
