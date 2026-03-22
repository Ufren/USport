import { getUserInfo, removeToken, removeUserInfo } from "../../utils/storage";
import { showSuccess } from "../../utils/helpers";

Page<IPageOption>({
  data: {
    userInfo: {
      id: 0,
      username: "",
      nickname: "",
      avatar: "",
      email: "",
    } as any,
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
    wx.navigateTo({ url: "/pages/profile/profile" });
  },

  onMenuClick(e: any) {
    const type = e.currentTarget.dataset.type;
    console.log("menu click:", type);
  },

  onLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          removeToken();
          removeUserInfo();
          showSuccess("已退出登录");
          setTimeout(() => {
            wx.redirectTo({ url: "/pages/login/login" });
          }, 1500);
        }
      },
    });
  },
});
