import type {
  CreateMembershipOrderRequest,
  MembershipOrderItem,
  MembershipPlanItem,
  SubscriptionSummary,
} from "@usport/shared";

import { httpClient } from "../utils/http";

export const membershipApi = {
  async plans(): Promise<MembershipPlanItem[]> {
    return httpClient.get<MembershipPlanItem[]>("/membership/plans");
  },

  async summary(): Promise<SubscriptionSummary> {
    return httpClient.get<SubscriptionSummary>("/membership/summary");
  },

  async orders(): Promise<MembershipOrderItem[]> {
    return httpClient.get<MembershipOrderItem[]>("/membership/orders");
  },

  async createOrder(
    payload: CreateMembershipOrderRequest,
  ): Promise<MembershipOrderItem> {
    return httpClient.post<MembershipOrderItem>("/membership/orders", payload);
  },

  async mockPayOrder(orderId: number): Promise<MembershipOrderItem> {
    return httpClient.post<MembershipOrderItem>(
      `/membership/orders/${orderId}/mock-pay`,
    );
  },
};
