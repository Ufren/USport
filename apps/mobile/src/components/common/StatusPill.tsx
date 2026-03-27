import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  getActivityStatusMeta,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
  type ActivityStatus,
} from "@usport/shared";

type Props = {
  status: ActivityStatus;
};

export function StatusPill({ status }: Props) {
  const meta = getActivityStatusMeta(status);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: meta.backgroundColor,
          borderColor: usportColors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: meta.textColor }]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: usportTypography.caption,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
