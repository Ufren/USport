import type { InvitationItem, MessagePreview } from "@usport/shared";

import { invitationApi } from "../../services/invitation";
import { showError, showSuccess } from "../../utils/helpers";
import { getUserInfo } from "../../utils/storage";

Page({
  data: {
    loading: true,
    isLoggedIn: false,
    invitations: [] as InvitationItem[],
    messages: [] as MessagePreview[],
    pendingCount: 0,
  },

  onLoad() {
    void this.loadPage();
  },

  onShow() {
    void this.loadPage();
  },

  onPullDownRefresh() {
    void this.loadPage(true);
  },

  async loadPage(stopPullDown = false) {
    const isLoggedIn = Boolean(getUserInfo()?.id);
    this.setData({
      isLoggedIn,
      loading: isLoggedIn,
    });

    if (!isLoggedIn) {
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
      return;
    }

    try {
      const [invitations, messages] = await Promise.all([
        invitationApi.list(),
        invitationApi.messages(),
      ]);

      this.setData({
        invitations,
        messages,
        pendingCount: invitations.filter((item) => item.status === "pending")
          .length,
      });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "获取邀约失败");
    } finally {
      this.setData({ loading: false });
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  onGoLogin() {
    wx.navigateTo({ url: "/pages/auth/index" });
  },

  onInvitationTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { activityId?: string | number }
    >,
  ) {
    const activityId = String(e.currentTarget.dataset.activityId ?? "");
    if (!activityId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`,
    });
  },

  onMessageTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number }
    >,
  ) {
    const messageID = Number(e.currentTarget.dataset.id ?? 0);
    const matchedInvitation = (this.data.invitations as InvitationItem[]).find(
      (item) => item.id === messageID,
    );
    const activityId = String(matchedInvitation?.activityId ?? "");
    if (!activityId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`,
    });
  },

  onRespondTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number; action?: "accept" | "decline" }
    >,
  ) {
    const id = String(e.currentTarget.dataset.id ?? "");
    const action = e.currentTarget.dataset.action;
    if (!id || !action) {
      return;
    }

    const title = action === "accept" ? "接受邀约" : "婉拒邀约";
    const content =
      action === "accept"
        ? "接受后系统会同步尝试为你锁定活动席位。"
        : "拒绝后这条邀约会进入已处理状态。";

    wx.showModal({
      title,
      content,
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        try {
          // 邀约响应和席位处理统一交给后端，避免端上重复推演状态规则。
          await invitationApi.respond(id, action);
          showSuccess(action === "accept" ? "已接受邀约" : "已婉拒邀约");
          await this.loadPage();
        } catch (error: unknown) {
          showError(error instanceof Error ? error.message : "处理邀约失败");
        }
      },
    });
  },
});
