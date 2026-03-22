import { initStore } from "./store";

App<IAppOption>({
  globalData: {
    userInfo: null,
  },
  store: initStore(),
  onLaunch() {
    this.checkLoginStatus();
  },
  checkLoginStatus() {
    const token = wx.getStorageSync("token");
    if (token) {
      this.store.dispatch("user/getUserInfo");
    }
  },
});

wx.utils = {
  getStorage: (key: string) => wx.getStorageSync(key),
  setStorage: (key: string, value: any) => wx.setStorageSync(key, value),
  removeStorage: (key: string) => wx.removeStorageSync(key),
};

wx.api = {
  baseURL: "http://localhost:8080/api/v1",
};
