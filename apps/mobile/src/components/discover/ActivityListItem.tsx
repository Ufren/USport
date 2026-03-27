import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type ExperienceActivity,
} from "@usport/shared";

import { StatusPill } from "../common/StatusPill";

type Props = {
  activity: ExperienceActivity;
  onPress?: () => void;
};

export function ActivityListItem({ activity, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          {activity.isOfficial ? (
            <View style={styles.officialBadge}>
              <Text style={styles.officialBadgeText}>官方活动</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.subtitle}>{activity.subtitle}</Text>
        </View>
        <StatusPill status={activity.status} />
      </View>

      <View style={styles.infoGrid}>
        <Text style={styles.infoText}>{activity.startTimeLabel}</Text>
        <Text style={styles.infoText}>
          {activity.district} · {activity.venueName}
        </Text>
        <Text style={styles.infoText}>
          {activity.feeLabel} · {activity.participantSummary}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.attendance}>{activity.attendanceLabel}</Text>
        <Text style={styles.action}>{activity.actionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    shadowColor: usportColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  containerPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.94,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: usportSpacing.md,
  },
  titleGroup: {
    gap: usportSpacing.sm,
    flex: 1,
  },
  officialBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: usportSpacing.md,
    paddingVertical: 6,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.pageBackgroundElevated,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  officialBadgeText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "800",
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h3,
    fontWeight: "800",
    lineHeight: 26,
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 21,
  },
  infoGrid: {
    gap: usportSpacing.sm,
  },
  infoText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: usportSpacing.md,
  },
  attendance: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    flex: 1,
    lineHeight: 18,
  },
  action: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "800",
  },
});
