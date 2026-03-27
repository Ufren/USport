import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { usportColors, usportSpacing, usportTypography } from "@usport/shared";

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: usportSpacing.xs,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h3,
    fontWeight: "800",
    lineHeight: 26,
  },
  subtitle: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 21,
  },
});
