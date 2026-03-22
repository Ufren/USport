export interface IAppOption {
  globalData: {
    userInfo: GetStorageInfo<any> | null;
  };
  store: any;
  checkLoginStatus: () => void;
}

type IPageOption = WechatMiniprogram.Page.Options<
  WechatMiniprogram.IAnyObject,
  WechatMiniprogram.IAnyObject
>;
