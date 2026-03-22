import { initStore } from "./store";
import { getToken, getUserInfo } from "./utils/storage";

App<IAppOption>({
  globalData: {
    userInfo: null,
    token: null,
  },
  store: initStore(),
  onLaunch() {
    this.checkLoginStatus();
  },
  checkLoginStatus() {
    const token = getToken();
    if (!token) {
      return;
    }

    const userInfo = getUserInfo();
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.store.dispatch("session/hydrate", { token, userInfo });
  },
});
