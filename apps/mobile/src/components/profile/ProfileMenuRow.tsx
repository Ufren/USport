import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type ProfileMenuItem,
} from "@usport/shared";

type Props = {
  item: ProfileMenuItem;
  onPress?: () => void;
};

export function ProfileMenuRow({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: usportSpacing.md,
    paddingVertical: usportSpacing.lg,
    paddingHorizontal: usportSpacing.xl,
    borderRadius: usportRadius.lg,
    backgroundColor: usportColors.cardBackground,
    borderWidth: 1,
    borderColor: usportColors.border,
    shadowColor: usportColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  containerPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.95,
  },
  content: {
    flex: 1,
    gap: usportSpacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: usportSpacing.sm,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: usportColors.warningSoft,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  badgeText: {
    color: usportColors.warning,
    fontSize: usportTypography.caption,
    fontWeight: "800",
  },
  description: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  arrow: {
    color: usportColors.textTertiary,
    fontSize: 24,
    lineHeight: 24,
  },
});
