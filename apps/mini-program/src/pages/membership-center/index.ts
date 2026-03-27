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
    payingOrderId: 0,
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
      const order = await membershipApi.createOrder({ planCode });
      showSuccess("会员订单已创建");
      wx.showModal({
        title: "立即支付",
        content: "是否现在完成模拟支付，立即开通会员权益？",
        confirmText: "立即支付",
        success: (res) => {
          if (res.confirm) {
            void this.payOrder(order.id);
          }
        },
      });
      await this.loadPage();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "创建会员订单失败");
    } finally {
      this.setData({ purchasingCode: "" });
    }
  },

  async onPayOrder(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { id?: string }>,
  ) {
    const orderId = Number(e.currentTarget.dataset.id ?? 0);
    if (!orderId) {
      return;
    }

    await this.payOrder(orderId);
  },

  async payOrder(orderId: number) {
    this.setData({ payingOrderId: orderId });
    try {
      await membershipApi.mockPayOrder(orderId);
      showSuccess("会员权益已生效");
      await this.loadPage();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "会员支付失败");
    } finally {
      this.setData({ payingOrderId: 0 });
    }
  },
});
