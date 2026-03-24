import type {
  ActivitySignupStatus,
  ExperienceActivityDetail,
} from "@usport/shared";
import { getExperienceActivityDetail } from "@usport/shared";

import {
  persistSignupStatus,
  readSignupStatus,
  resolveActivityDetail,
} from "../../features/activity-flow/storage";
import { showSuccess } from "../../utils/helpers";
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
    this.loadPage(options?.id ?? "1001");
  },

  onShow() {
    this.loadPage(this.data.currentActivityId || "1001");
  },

  loadPage(activityId: string) {
    const userInfo = getUserInfo();
    const fallbackDetail = getExperienceActivityDetail(activityId);
    const activityDetail = resolveActivityDetail(activityId, fallbackDetail);
    const signupStatus = activityDetail ? readSignupStatus(activityId) : "none";
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
        title: "\u4f60\u5df2\u7ecf\u5728\u8fd9\u573a\u6d3b\u52a8\u91cc\u4e86",
        icon: "none",
      });
      return;
    }

    let nextStatus: ActivitySignupStatus | null = null;
    let successText = "";

    if (currentActivity.status === "published") {
      nextStatus = "registered";
      successText = "\u62a5\u540d\u6210\u529f";
    }

    if (currentActivity.status === "full" && currentActivity.allowWaitlist) {
      nextStatus = "waitlisted";
      successText = "\u5df2\u8fdb\u5165\u5019\u8865";
    }

    if (!nextStatus) {
      wx.showToast({
        title: "\u5f53\u524d\u72b6\u6001\u6682\u4e0d\u53ef\u62a5\u540d",
        icon: "none",
      });
      return;
    }

    persistSignupStatus(currentActivity.id, nextStatus);
    showSuccess(successText);
    this.loadPage(currentActivity.id);
  },

  onSecondaryAction() {
    if (this.data.isEmpty) {
      wx.switchTab({ url: "/pages/discover/index" });
      return;
    }

    wx.showToast({
      title: "\u5206\u4eab\u80fd\u529b\u5f00\u53d1\u4e2d",
      icon: "none",
    });
  },
});
