import type { UserInfo } from "@usport/shared";

import { STORAGE_KEYS } from "./constants";

export function getStorage<T = unknown>(key: string): T | null {
  const value = wx.getStorageSync(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export function setStorage<T = unknown>(key: string, value: T): void {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  wx.setStorageSync(key, stringValue);
}

export function removeStorage(key: string): void {
  wx.removeStorageSync(key);
}

export function clearStorage(): void {
  wx.clearStorageSync();
}

export function getToken(): string | null {
  return getStorage<string>(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  setStorage(STORAGE_KEYS.TOKEN, token);
}

export function removeToken(): void {
  removeStorage(STORAGE_KEYS.TOKEN);
}

export function getUserInfo(): UserInfo | null {
  return getStorage<UserInfo>(STORAGE_KEYS.USER_INFO);
}

export function setUserInfo(userInfo: UserInfo): void {
  setStorage(STORAGE_KEYS.USER_INFO, userInfo);
}

export function removeUserInfo(): void {
  removeStorage(STORAGE_KEYS.USER_INFO);
}
