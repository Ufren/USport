import type { InboxWorkspace, InvitationItem } from "@usport/shared";

import { invitationApi } from "../../services/invitation";
import { showError, showSuccess } from "../../utils/helpers";
import { getUserInfo } from "../../utils/storage";

const emptyWorkspace: InboxWorkspace = {
  pendingCount: 0,
  unreadCount: 0,
  totalMessages: 0,
  invitations: [],
  messages: [],
};

Page({
  data: {
    loading: true,
    isLoggedIn: false,
    workspace: emptyWorkspace,
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
      this.setData({ workspace: emptyWorkspace });
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
      return;
    }

    try {
      const workspace = await invitationApi.workspace();
      this.setData({ workspace });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "获取消息工作区失败");
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

    wx.navigateTo({ url: `/pages/activity-detail/index?id=${activityId}` });
  },

  onMessageTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number }
    >,
  ) {
    const messageId = Number(e.currentTarget.dataset.id ?? 0);
    const matchedInvitation = (
      this.data.workspace.invitations as InvitationItem[]
    ).find((item) => item.id === messageId);

    if (!matchedInvitation) {
      return;
    }

    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${matchedInvitation.activityId}`,
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

    wx.showModal({
      title: action === "accept" ? "接受邀约" : "婉拒邀约",
      content:
        action === "accept"
          ? "接受后系统会尝试为你锁定活动名额。"
          : "婉拒后，这条邀约会进入已处理状态。",
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        try {
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
