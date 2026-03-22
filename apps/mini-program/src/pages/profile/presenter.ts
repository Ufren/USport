import type { UserInfo } from "@usport/shared";

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
      : "登录后开始沉淀履约记录",
    menuItems: [
      {
        id: "activities",
        title: "我的活动",
        description: "查看已报名、待出发和已完成的运动局。",
      },
      {
        id: "invitations",
        title: "我的邀约",
        description: "集中处理收到的邀约与发起记录。",
      },
      {
        id: "credit",
        title: "信用与履约",
        description: "查看到场、取消和复约表现。",
        badge: "重要",
      },
      {
        id: "membership",
        title: "会员权益",
        description: "解锁更高曝光和更强筛选能力。",
      },
    ],
  };
}
