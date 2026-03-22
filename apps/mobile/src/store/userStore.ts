import { create } from "zustand";
import type { UserInfo } from "../types/user";

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  hydrateSession: (session: {
    userInfo: UserInfo | null;
    token: string | null;
  }) => void;
  setUserInfo: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

function getIsLoggedIn(
  userInfo: UserInfo | null,
  token: string | null,
): boolean {
  return Boolean(userInfo || token);
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: null,
  isLoggedIn: false,
  hydrateSession: ({ userInfo, token }) =>
    set({
      userInfo,
      token,
      isLoggedIn: getIsLoggedIn(userInfo, token),
    }),
  setUserInfo: (userInfo) =>
    set((state) => ({
      userInfo,
      isLoggedIn: getIsLoggedIn(userInfo, state.token),
    })),
  setToken: (token) =>
    set((state) => ({
      token,
      isLoggedIn: getIsLoggedIn(state.userInfo, token),
    })),
  logout: () => set({ userInfo: null, token: null, isLoggedIn: false }),
}));
