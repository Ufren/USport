import { request } from "../utils/helpers";
import type { ApiResponse } from "../types/api";

export interface UserInfo {
  id: number;
  openid?: string;
  unionid?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
  is_new_user: boolean;
}

export const userApi = {
  wechatLogin(code: string): Promise<ApiResponse<LoginResult>> {
    return request.post<LoginResult>("/users/wechat_login", {}, { code });
  },

  phoneLogin(code: string): Promise<ApiResponse<LoginResult>> {
    return request.post<LoginResult>("/users/phone_login", { code });
  },

  getUserInfo(id: number): Promise<ApiResponse<UserInfo>> {
    return request.get<UserInfo>(`/users/${id}`);
  },

  updateUserInfo(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
    return request.put<UserInfo>("/users/profile", data);
  },
};
