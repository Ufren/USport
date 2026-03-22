import { create } from "zustand";
import type { UserInfo } from "../types/user";

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  setUserInfo: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: null,
  token: null,
  isLoggedIn: false,
  setUserInfo: (user) => set({ userInfo: user, isLoggedIn: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ userInfo: null, token: null, isLoggedIn: false }),
}));
