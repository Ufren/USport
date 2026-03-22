import { httpClient } from "../utils/http";
import type { UserInfo, LoginResult } from "../types/user";

export const userApi = {
  async wechatLogin(code: string): Promise<LoginResult> {
    return httpClient.post<LoginResult>("/users/wechat_login", undefined, {
      params: { code },
    });
  },

  async phoneLogin(code: string): Promise<LoginResult> {
    return httpClient.post<LoginResult>("/users/phone_login", { code });
  },

  async getUserInfo(id: number): Promise<UserInfo> {
    return httpClient.get<UserInfo>(`/users/${id}`);
  },
};
