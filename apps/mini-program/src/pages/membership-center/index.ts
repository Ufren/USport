import type {
  MembershipOrderItem,
  MembershipPlanItem,
  SubscriptionSummary,
} from "@usport/shared";

import { membershipApi } from "../../services/membership";
import { showError, showSuccess } from "../../utils/helpers";

Page({
  data: {
    loading: true,
    plans: [] as MembershipPlanItem[],
    summary: null as SubscriptionSummary | null,
    orders: [] as MembershipOrderItem[],
    purchasingCode: "",
  },

  onLoad() {
    void this.loadPage();
  },

  onPullDownRefresh() {
    void this.loadPage(true);
  },

  async loadPage(stopPullDown = false) {
    this.setData({ loading: true });
    try {
      const [plans, summary, orders] = await Promise.all([
        membershipApi.plans(),
        membershipApi.summary(),
        membershipApi.orders(),
      ]);
      this.setData({ plans, summary, orders });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "获取会员信息失败");
    } finally {
      this.setData({ loading: false });
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  async onPurchase(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { code?: string }>,
  ) {
    const planCode = String(e.currentTarget.dataset.code ?? "");
    if (!planCode) {
      return;
    }

    this.setData({ purchasingCode: planCode });
    try {
      await membershipApi.createOrder({ planCode });
      showSuccess("会员已开通");
      await this.loadPage();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "会员开通失败");
    } finally {
      this.setData({ purchasingCode: "" });
    }
  },
});
