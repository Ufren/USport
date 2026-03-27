import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
  usportMotion,
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
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
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
    width: 268,
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: usportColors.border,
    shadowColor: usportColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 4,
  },
  containerPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.96,
  },
  cover: {
    backgroundColor: usportColors.pageBackgroundElevated,
    padding: usportSpacing["2xl"],
    gap: usportSpacing.sm,
  },
  coverTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
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
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  featureText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
  },
});
