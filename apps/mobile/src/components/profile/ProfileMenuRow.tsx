import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  usportColors,
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
    <Pressable style={styles.container} onPress={onPress}>
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
    borderRadius: usportRadius.md,
    backgroundColor: usportColors.cardBackground,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  content: {
    flex: 1,
    gap: usportSpacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: usportSpacing.sm,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: usportColors.warningSoft,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: usportColors.warning,
    fontSize: usportTypography.caption,
    fontWeight: "700",
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
