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

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  phone?: string;
}
