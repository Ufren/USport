import { userApi } from "../../services/user";
import { setToken, setUserInfo } from "../../utils/storage";
import { showError, showSuccess } from "../../utils/helpers";

Page({
  data: {
    loading: false,
    agreementAccepted: false,
    valuePoints: [
      {
        id: "match",
        title: "先找能成局的人",
        description: "优先推荐今晚和周末真正有履约概率的运动局。",
      },
      {
        id: "venue",
        title: "场馆和搭子一起考虑",
        description: "不是泛社交，而是围绕真实运动场景快速成局。",
      },
      {
        id: "credit",
        title: "履约和信用可见",
        description: "高到场率和复约率会持续影响你的推荐排序。",
      },
    ],
  },

  onToggleAgreement() {
    this.setData({
      agreementAccepted: !this.data.agreementAccepted,
    });
  },

  ensureAgreementAccepted() {
    if (this.data.agreementAccepted) {
      return true;
    }

    showError("请先同意用户协议与隐私政策");
    return false;
  },

  async onWechatLogin() {
    if (!this.ensureAgreementAccepted()) {
      return;
    }

    this.setData({ loading: true });

    try {
      const loginResult = await wx.login();
      if (!loginResult.code) {
        showError("获取微信授权失败");
        return;
      }

      const res = await userApi.wechatLogin(loginResult.code);
      if (res.code === 0) {
        setToken(res.data.token);
        setUserInfo(res.data.user);
        getApp<IAppOption>().store.dispatch("session/hydrate", {
          token: res.data.token,
          userInfo: res.data.user,
        });

        showSuccess(res.data.is_new_user ? "注册成功" : "登录成功");

        setTimeout(() => {
          wx.switchTab({ url: "/pages/discover/index" });
        }, 1500);
      } else {
        showError(res.message || "登录失败");
      }
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "登录失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async onGetPhoneNumber(e: WechatMiniprogram.CustomEvent<{ code?: string }>) {
    if (!this.ensureAgreementAccepted()) {
      return;
    }

    if (!e.detail.code) {
      showError("获取手机号失败");
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await userApi.phoneLogin(e.detail.code);
      if (res.code === 0) {
        setToken(res.data.token);
        setUserInfo(res.data.user);
        getApp<IAppOption>().store.dispatch("session/hydrate", {
          token: res.data.token,
          userInfo: res.data.user,
        });

        showSuccess(res.data.is_new_user ? "注册成功" : "登录成功");

        setTimeout(() => {
          wx.switchTab({ url: "/pages/discover/index" });
        }, 1500);
      } else {
        showError(res.message || "登录失败");
      }
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "登录失败");
    } finally {
      this.setData({ loading: false });
    }
  },
});
