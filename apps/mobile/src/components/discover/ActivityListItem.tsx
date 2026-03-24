import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
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
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
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
    borderRadius: usportRadius.md,
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
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
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  infoGrid: {
    gap: usportSpacing.sm,
  },
  infoText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: usportSpacing.md,
  },
  attendance: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    flex: 1,
  },
  action: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
});
