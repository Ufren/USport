export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: Record<string, string>;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email: string;
  phone?: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}
