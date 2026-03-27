import type {
  InboxWorkspace,
  InvitationItem,
  MessagePreview,
} from "@usport/shared";

import { httpClient } from "../utils/http";

export const invitationApi = {
  async list(): Promise<InvitationItem[]> {
    return httpClient.get<InvitationItem[]>("/invitations");
  },

  async messages(): Promise<MessagePreview[]> {
    return httpClient.get<MessagePreview[]>("/messages");
  },

  async workspace(): Promise<InboxWorkspace> {
    return httpClient.get<InboxWorkspace>("/messages/workspace");
  },

  async respond(
    id: string | number,
    action: "accept" | "decline",
  ): Promise<InvitationItem> {
    return httpClient.post<InvitationItem>(`/invitations/${id}/respond`, {
      action,
    });
  },
};
