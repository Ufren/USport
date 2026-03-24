import type { UserInfo } from "@usport/shared";
import { profileMenuItems } from "@usport/shared";

export interface UserMenuItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

export interface ProfilePageState {
  isLoggedIn: boolean;
  displayName: string;
  handle: string;
  avatarInitial: string;
  completionRate: string;
  creditScore: string;
  attendanceSummary: string;
  menuItems: UserMenuItem[];
}

function buildDisplayName(userInfo: UserInfo | null): string {
  if (!userInfo) {
    return "还没有登录";
  }

  return userInfo.nickname || userInfo.phone || userInfo.openid || "运动用户";
}

function buildHandle(userInfo: UserInfo | null): string {
  if (!userInfo) {
    return "@guest";
  }

  const rawValue = userInfo.phone || userInfo.openid || "guest";
  return rawValue.startsWith("@") ? rawValue : `@${rawValue}`;
}

function buildAvatarInitial(displayName: string): string {
  return displayName.charAt(0).toUpperCase() || "U";
}

export function buildProfilePageState(
  userInfo: UserInfo | null,
): ProfilePageState {
  const displayName = buildDisplayName(userInfo);

  return {
    isLoggedIn: Boolean(userInfo?.id),
    displayName,
    handle: buildHandle(userInfo),
    avatarInitial: buildAvatarInitial(displayName),
    completionRate: userInfo?.nickname && userInfo?.phone ? "86%" : "42%",
    creditScore: userInfo?.id ? "98" : "--",
    attendanceSummary: userInfo?.id
      ? "近 30 天已完成 7 次到场"
      : "登录后开始沉淀你的履约记录",
    menuItems: profileMenuItems,
  };
}
