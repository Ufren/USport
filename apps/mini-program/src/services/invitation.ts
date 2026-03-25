import type { InvitationItem, MessagePreview } from "@usport/shared";

import { request } from "../utils/helpers";
import type { ApiResponse } from "../types/api";

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) {
    throw new Error(response.message || "请求失败");
  }

  return response.data;
}

export const invitationApi = {
  async list(): Promise<InvitationItem[]> {
    return unwrapResponse(await request.get<InvitationItem[]>("/invitations"));
  },

  async messages(): Promise<MessagePreview[]> {
    return unwrapResponse(await request.get<MessagePreview[]>("/messages"));
  },

  async respond(
    id: string | number,
    action: "accept" | "decline",
  ): Promise<InvitationItem> {
    return unwrapResponse(
      await request.post<InvitationItem>(`/invitations/${id}/respond`, {
        action,
      }),
    );
  },
};
