import type { ActivityStatus } from "../types";

export const usportColors = {
  brandPrimary: "#0A84FF",
  brandPrimaryPressed: "#0066CC",
  brandSecondary: "#EAF2FF",
  brandAccent: "#34C759",
  pageBackground: "#F5F5F7",
  pageBackgroundElevated: "#FBFBFD",
  cardBackground: "rgba(255, 255, 255, 0.88)",
  cardBackgroundStrong: "#FFFFFF",
  mutedBackground: "#EEF0F4",
  border: "rgba(60, 60, 67, 0.12)",
  borderStrong: "rgba(60, 60, 67, 0.18)",
  divider: "rgba(60, 60, 67, 0.08)",
  textPrimary: "#111111",
  textSecondary: "rgba(17, 17, 17, 0.74)",
  textTertiary: "rgba(17, 17, 17, 0.48)",
  textInverse: "#FFFFFF",
  success: "#34C759",
  successSoft: "#EAF8EF",
  warning: "#FF9F0A",
  warningSoft: "#FFF5E6",
  danger: "#FF3B30",
  dangerSoft: "#FEEDEC",
  info: "#0A84FF",
  overlay: "rgba(17, 17, 17, 0.06)",
  shadow: "rgba(15, 23, 42, 0.08)",
  shadowStrong: "rgba(15, 23, 42, 0.14)",
} as const;

export const usportSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const usportRadius = {
  sm: 12,
  md: 18,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const usportTypography = {
  hero: 34,
  h1: 30,
  h2: 24,
  h3: 20,
  title: 18,
  body: 16,
  bodySm: 14,
  caption: 12,
} as const;

export const usportMotion = {
  pressScale: 0.985,
  durationFast: 120,
  durationBase: 180,
} as const;

const activityStatusMeta: Record<
  ActivityStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  published: {
    label: "报名中",
    backgroundColor: usportColors.successSoft,
    textColor: usportColors.success,
  },
  full: {
    label: "名额紧张",
    backgroundColor: usportColors.warningSoft,
    textColor: usportColors.warning,
  },
  signup_closed: {
    label: "已截止",
    backgroundColor: usportColors.mutedBackground,
    textColor: usportColors.textSecondary,
  },
  ongoing: {
    label: "进行中",
    backgroundColor: usportColors.brandPrimary,
    textColor: usportColors.textInverse,
  },
  completed: {
    label: "已完成",
    backgroundColor: usportColors.mutedBackground,
    textColor: usportColors.textSecondary,
  },
  cancelled: {
    label: "已取消",
    backgroundColor: usportColors.dangerSoft,
    textColor: usportColors.danger,
  },
};

export function getActivityStatusMeta(status: ActivityStatus) {
  // 统一活动状态在多端的视觉映射，避免各端分别维护颜色和文案。
  return activityStatusMeta[status];
}
