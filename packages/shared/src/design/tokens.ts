import type { ActivityStatus } from "../types";

export const usportColors = {
  brandPrimary: "#156B52",
  brandPrimaryPressed: "#0F5A45",
  brandSecondary: "#B6F36A",
  brandAccent: "#FF7A1A",
  pageBackground: "#F4F7F2",
  cardBackground: "#FFFFFF",
  mutedBackground: "#EAF0E8",
  border: "#DCE2DD",
  borderStrong: "#B8C1BB",
  textPrimary: "#131714",
  textSecondary: "#2D3631",
  textTertiary: "#66726C",
  textInverse: "#FFFFFF",
  success: "#1F9D61",
  successSoft: "#E8F7EF",
  warning: "#E6A019",
  warningSoft: "#FFF4D8",
  danger: "#D64545",
  dangerSoft: "#FDEDED",
  info: "#2F7EF7",
  shadow: "rgba(19, 23, 20, 0.10)",
  shadowStrong: "rgba(19, 23, 20, 0.16)",
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
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const usportTypography = {
  hero: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  title: 18,
  body: 16,
  bodySm: 14,
  caption: 12,
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
