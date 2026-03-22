import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  getActivityStatusMeta,
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
    <View style={[styles.container, { backgroundColor: meta.backgroundColor }]}>
      <Text style={[styles.label, { color: meta.textColor }]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  label: {
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
});
