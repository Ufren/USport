import type { UserInfo } from "@usport/shared";

import { getUserInfo, removeToken, removeUserInfo } from "../../utils/storage";
import { showSuccess } from "../../utils/helpers";
import { buildProfilePageState } from "./presenter.clean";

Page({
  data: {
    userInfo: null as UserInfo | null,
    ...buildProfilePageState(null),
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = getUserInfo();
    this.setData({
      userInfo,
      ...buildProfilePageState(userInfo),
    });
  },

  onEditProfile() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/index" });
      return;
    }

    wx.showToast({
      title: "资料编辑功能开发中",
      icon: "none",
    });
  },

  onPrimaryAction() {
    if (this.data.isLoggedIn) {
      this.onEditProfile();
      return;
    }

    this.onGoLogin();
  },

  onMenuClick(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { type?: string }>,
  ) {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: "/pages/auth/index" });
      return;
    }

    const menuType = String(e.currentTarget.dataset.type ?? "");

    if (menuType === "activities") {
      wx.navigateTo({ url: "/pages/create-activity/index" });
      return;
    }

    wx.showToast({
      title: "该能力正在完善中",
      icon: "none",
    });
  },

  onGoLogin() {
    wx.navigateTo({ url: "/pages/auth/index" });
  },

  onLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
        if (res.confirm) {
          removeToken();
          removeUserInfo();
          getApp<IAppOption>().store.dispatch("session/clear");
          showSuccess("已退出登录");
          this.setData({
            userInfo: null,
            ...buildProfilePageState(null),
          });
          setTimeout(() => {
            wx.navigateTo({ url: "/pages/auth/index" });
          }, 800);
        }
      },
    });
  },
});
