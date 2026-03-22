import { userApi } from "../../services/user";
import { setToken, setUserInfo } from "../../utils/storage";
import { showError, showSuccess } from "../../utils/helpers";

Page<IPageOption>({
  data: {
    loading: false,
  },

  async onWechatLogin() {
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

        if (res.data.is_new_user) {
          showSuccess("注册成功");
        } else {
          showSuccess("登录成功");
        }

        setTimeout(() => {
          wx.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } else {
        showError(res.message || "登录失败");
      }
    } catch (error: any) {
      showError(error.message || "登录失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  async onGetPhoneNumber(e: any) {
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

        if (res.data.is_new_user) {
          showSuccess("注册成功");
        } else {
          showSuccess("登录成功");
        }

        setTimeout(() => {
          wx.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } else {
        showError(res.message || "登录失败");
      }
    } catch (error: any) {
      showError(error.message || "登录失败");
    } finally {
      this.setData({ loading: false });
    }
  },
});
