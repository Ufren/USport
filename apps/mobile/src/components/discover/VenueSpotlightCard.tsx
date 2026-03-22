import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
  type VenueSpotlight,
} from "@usport/shared";

type Props = {
  venue: VenueSpotlight;
};

export function VenueSpotlightCard({ venue }: Props) {
  return (
    <Pressable style={styles.container}>
      <View style={styles.cover}>
        <Text style={styles.coverTitle}>{venue.name}</Text>
        <Text style={styles.coverSubtitle}>{venue.surfaceLabel}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.location}>
          {venue.district} · {venue.commuteLabel}
        </Text>
        <Text style={styles.vibe}>{venue.vibe}</Text>

        <View style={styles.featureRow}>
          {venue.features.map((feature) => (
            <View key={feature} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  cover: {
    backgroundColor: usportColors.mutedBackground,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  coverTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  coverSubtitle: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  body: {
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  location: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "600",
  },
  vibe: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: usportSpacing.sm,
  },
  featureTag: {
    backgroundColor: usportColors.pageBackground,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  featureText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
  },
});
