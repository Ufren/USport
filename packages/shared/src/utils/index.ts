import type { UserProfile } from "../types";

export function formatDate(
  date: string | Date,
  format: string = "YYYY-MM-DD",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

export function parseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

export function toString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function toNumber(value: unknown, defaultValue: number = 0): number {
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
}

export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number,
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  limit: number,
): (...args: TArgs) => void {
  let inThrottle = false;

  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getUserDisplayName(
  user: Pick<UserProfile, "nickname" | "phone" | "openid"> | null | undefined,
  fallback: string = "游客",
): string {
  return user?.nickname || user?.phone || user?.openid || fallback;
}

export function getUserHandle(
  user: Pick<UserProfile, "phone" | "openid"> | null | undefined,
  fallback: string = "guest",
): string {
  const value = user?.phone || user?.openid || fallback;
  return value.startsWith("@") ? value : `@${value}`;
}

export function getErrorMessage(
  error: unknown,
  fallback: string = "操作失败",
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getUserInitial(
  user: Pick<UserProfile, "nickname" | "phone" | "openid"> | null | undefined,
  fallback: string = "U",
): string {
  const displayName = getUserDisplayName(user, fallback).trim();
  return displayName.charAt(0).toUpperCase() || fallback;
}
