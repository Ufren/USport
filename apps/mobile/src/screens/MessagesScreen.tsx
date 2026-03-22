import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  messagePreviews,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
} from "@usport/shared";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../App";
import { useUserStore } from "../store/userStore";
import { SectionHeader } from "../components/common/SectionHeader";

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>消息会在成局后逐步沉淀</Text>
        <Text style={styles.emptyText}>
          先登录，之后你收到的邀约、报名进度和活动群消息都会聚合在这里。
        </Text>
        <Pressable
          style={styles.emptyButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.emptyButtonText}>去登录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader
        title="消息与进度"
        subtitle="把邀约、报名更新和活动会话收进同一个工作区。"
      />

      {messagePreviews.map((message) => (
        <Pressable key={message.id} style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageTime}>{message.timestampLabel}</Text>
          </View>
          <Text style={styles.messagePreview}>{message.preview}</Text>
          {message.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{message.unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
  },
  content: {
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
  },
  messageCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  messageTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
    flex: 1,
  },
  messageTime: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  messagePreview: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  unreadBadge: {
    alignSelf: "flex-start",
    backgroundColor: usportColors.brandAccent,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.sm,
    paddingVertical: 2,
  },
  unreadText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
    padding: usportSpacing["3xl"],
    justifyContent: "center",
    gap: usportSpacing.lg,
  },
  emptyTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "700",
  },
  emptyText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  emptyButton: {
    alignSelf: "flex-start",
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing.md,
  },
  emptyButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
