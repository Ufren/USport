import type {
  ActivitySignupStatus,
  ExperienceActivityDetail,
} from "@usport/shared";
import { getExperienceActivityDetail } from "@usport/shared";

import { activityApi } from "../../services/activity";
import {
  persistSignupStatus,
  readSignupStatus,
  resolveActivityDetail,
} from "../../features/activity-flow/storage";
import { showError, showSuccess } from "../../utils/helpers";
import { getUserInfo } from "../../utils/storage";
import { buildActivityDetailPageState } from "./presenter";

Page({
  data: {
    currentActivity: null as ExperienceActivityDetail | null,
    currentActivityId: "1001",
    signupStatus: "none" as ActivitySignupStatus,
    isLoggedIn: false,
    ...buildActivityDetailPageState(null, "none", false),
  },

  onLoad(options?: Record<string, string | undefined>) {
    void this.loadPage(options?.id ?? "1001");
  },

  onShow() {
    void this.loadPage(this.data.currentActivityId || "1001");
  },

  async loadPage(activityId: string) {
    const userInfo = getUserInfo();
    const fallbackDetail = getExperienceActivityDetail(activityId);
    let activityDetail = resolveActivityDetail(activityId, fallbackDetail);

    if (activityId !== "created") {
      try {
        activityDetail = await activityApi.detail(activityId);
      } catch {
        activityDetail = resolveActivityDetail(activityId, fallbackDetail);
      }
    }

    const signupStatus = activityDetail
      ? readSignupStatus(activityDetail.id)
      : "none";
    const isLoggedIn = Boolean(userInfo?.id);

    this.setData({
      currentActivityId: activityId,
      currentActivity: activityDetail,
      signupStatus,
      isLoggedIn,
      ...buildActivityDetailPageState(activityDetail, signupStatus, isLoggedIn),
    });
  },

  onPrimaryAction() {
    void this.handlePrimaryAction();
  },

  async handlePrimaryAction() {
    const { currentActivity, signupStatus, isLoggedIn } = this.data;

    if (!currentActivity) {
      wx.switchTab({ url: "/pages/discover/index" });
      return;
    }

    if (!isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/index" });
      return;
    }

    if (signupStatus === "registered" || signupStatus === "waitlisted") {
      wx.showToast({
        title: "你已经在这场活动里了",
        icon: "none",
      });
      return;
    }

    if (
      currentActivity.status !== "published" &&
      !(currentActivity.status === "full" && currentActivity.allowWaitlist)
    ) {
      wx.showToast({
        title: "当前状态暂不可报名",
        icon: "none",
      });
      return;
    }

    try {
      const result = await activityApi.register(
        currentActivity.sourceActivityId ?? currentActivity.id,
      );
      const nextStatus = result.status as ActivitySignupStatus;
      persistSignupStatus(currentActivity.id, nextStatus);
      showSuccess(nextStatus === "waitlisted" ? "已进入候补" : "报名成功");
      await this.loadPage(
        String(currentActivity.sourceActivityId ?? currentActivity.id),
      );
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "报名失败");
    }
  },

  onSecondaryAction() {
    if (this.data.isEmpty) {
      wx.switchTab({ url: "/pages/discover/index" });
      return;
    }

    wx.showToast({
      title: "分享能力开发中",
      icon: "none",
    });
  },
});
