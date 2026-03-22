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
};

export function ActivitySpotlightCard({ activity }: Props) {
  return (
    <Pressable style={styles.container}>
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
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.lg,
    padding: usportSpacing["2xl"],
    gap: usportSpacing.lg,
    shadowColor: usportColors.shadowStrong,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sportLabel: {
    color: usportColors.brandSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  title: {
    color: usportColors.textInverse,
    fontSize: usportTypography.h1,
    fontWeight: "700",
    lineHeight: 34,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  metaGroup: {
    gap: usportSpacing.sm,
  },
  metaText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: usportTypography.bodySm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: usportSpacing.sm,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  tagText: {
    color: usportColors.textInverse,
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
    color: usportColors.textInverse,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  hostBadge: {
    color: "rgba(255,255,255,0.78)",
    fontSize: usportTypography.caption,
  },
  cta: {
    backgroundColor: usportColors.brandSecondary,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing.md,
  },
  ctaText: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
});
