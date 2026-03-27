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
};

export function ActivitySpotlightCard({ activity }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.glow} />
      <View style={styles.heroRow}>
        <StatusPill status={activity.status} />
        <Text style={styles.sportLabel}>{activity.sportLabel}</Text>
      </View>

      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.subtitle}>{activity.subtitle}</Text>

      <View style={styles.metaGroup}>
        <Text style={styles.metaText}>{activity.startTimeLabel}</Text>
        <Text style={styles.metaText}>
          {activity.district} · {activity.venueName}
        </Text>
        <Text style={styles.metaText}>{activity.participantSummary}</Text>
      </View>

      <View style={styles.tagRow}>
        {activity.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.hostBlock}>
          <Text style={styles.hostName}>{activity.hostName}</Text>
          <Text style={styles.hostBadge}>{activity.hostBadge}</Text>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>{activity.actionLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: usportColors.cardBackgroundStrong,
    borderRadius: usportRadius.xl,
    padding: usportSpacing["2xl"],
    gap: usportSpacing.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    shadowColor: usportColors.shadowStrong,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
    marginHorizontal: usportSpacing.xl,
  },
  containerPressed: {
    transform: [{ scale: usportMotion.pressScale }],
  },
  glow: {
    position: "absolute",
    top: -36,
    right: -18,
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: "rgba(10,132,255,0.10)",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sportLabel: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "800",
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h1,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  metaGroup: {
    gap: usportSpacing.sm,
  },
  metaText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: usportSpacing.sm,
  },
  tag: {
    backgroundColor: usportColors.pageBackground,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  tagText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: usportSpacing.md,
  },
  hostBlock: {
    gap: usportSpacing.xs,
    flex: 1,
  },
  hostName: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  hostBadge: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  cta: {
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing.md,
  },
  ctaText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.bodySm,
    fontWeight: "800",
  },
});
