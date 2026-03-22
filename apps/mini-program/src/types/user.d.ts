import type { UserInfo } from "@usport/shared";

export interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
}

export type { UserInfo };
