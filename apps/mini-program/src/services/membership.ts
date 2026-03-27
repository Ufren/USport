import type {
  ApiResponse,
  CreateMembershipOrderRequest,
  MembershipOrderItem,
  MembershipPlanItem,
  SubscriptionSummary,
} from "@usport/shared";

import { request } from "../utils/helpers";

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) {
    throw new Error(response.message || "请求失败");
  }

  return response.data;
}

export const membershipApi = {
  async plans(): Promise<MembershipPlanItem[]> {
    return unwrapResponse(
      await request.get<MembershipPlanItem[]>("/membership/plans"),
    );
  },

  async summary(): Promise<SubscriptionSummary> {
    return unwrapResponse(
      await request.get<SubscriptionSummary>("/membership/summary"),
    );
  },

  async orders(): Promise<MembershipOrderItem[]> {
    return unwrapResponse(
      await request.get<MembershipOrderItem[]>("/membership/orders"),
    );
  },

  async createOrder(
    payload: CreateMembershipOrderRequest,
  ): Promise<MembershipOrderItem> {
    return unwrapResponse(
      await request.post<MembershipOrderItem>("/membership/orders", payload),
    );
  },

  async mockPayOrder(orderId: number): Promise<MembershipOrderItem> {
    return unwrapResponse(
      await request.post<MembershipOrderItem>(
        `/membership/orders/${orderId}/mock-pay`,
      ),
    );
  },
};
