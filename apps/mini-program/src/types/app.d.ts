import type { UserInfo } from "@usport/shared";

declare global {
  interface IAppOption {
    globalData: {
      userInfo: UserInfo | null;
      token: string | null;
    };
    store: {
      dispatch: (action: string, payload?: unknown) => void;
      getState: () => unknown;
      subscribe: (listener: (state: unknown) => void) => () => void;
    };
    checkLoginStatus: () => void;
  }

  type IPageOption = WechatMiniprogram.Page.Options<
    WechatMiniprogram.IAnyObject,
    WechatMiniprogram.IAnyObject
  >;

  interface WechatUtils {
    getStorage: (key: string) => unknown;
    setStorage: (key: string, value: unknown) => void;
    removeStorage: (key: string) => void;
  }

  interface WechatApiConfig {
    baseURL: string;
  }
}

declare namespace WechatMiniprogram {
  interface Wx {
    utils: WechatUtils;
    api: WechatApiConfig;
  }
}

export {};
