import type { UserInfo } from "@usport/shared";

import { getUserInfo, removeToken, removeUserInfo } from "../../utils/storage";
import { showSuccess } from "../../utils/helpers";

Page({
  data: {
    userInfo: {
      id: 0,
      nickname: "",
      avatar: "",
      openid: "",
      phone: "",
      status: 0,
    } as UserInfo,
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = getUserInfo();
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  onEditProfile() {
    wx.showToast({
      title: "资料编辑功能开发中",
      icon: "none",
    });
  },

  onMenuClick(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { type?: string }>,
  ) {
    const type = e.currentTarget.dataset.type ?? "";
    wx.showToast({
      title: `${type} 功能开发中`,
      icon: "none",
    });
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
          setTimeout(() => {
            wx.redirectTo({ url: "/pages/login/login" });
          }, 1500);
        }
      },
    });
  },
});
