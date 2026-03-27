import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import {
  getErrorMessage,
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type InboxWorkspace,
  type InvitationItem,
  type MessagePreview,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { invitationApi } from "../services/invitation";
import { useUserStore } from "../store/userStore";

const emptyWorkspace: InboxWorkspace = {
  pendingCount: 0,
  unreadCount: 0,
  totalMessages: 0,
  invitations: [],
  messages: [],
};

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [workspace, setWorkspace] = useState<InboxWorkspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkspace = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextWorkspace = await invitationApi.workspace();
      setWorkspace(nextWorkspace);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取消息工作区"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setWorkspace(emptyWorkspace);
      setLoading(false);
      return;
    }

    void loadWorkspace();
  }, [isLoggedIn]);

  const openActivity = (activityId: number) => {
    navigation.navigate("ActivityDetail", { id: String(activityId) });
  };

  const renderInvitation = (item: InvitationItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => openActivity(item.activityId)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.activityTitle}</Text>
          <Text style={styles.cardMeta}>{item.venueLabel}</Text>
        </View>
        <Text style={styles.statusBadge}>{item.statusLabel}</Text>
      </View>
      <Text style={styles.cardCopy}>{item.message}</Text>
      <Text style={styles.cardMeta}>
        {item.senderName} · {item.senderBadge}
      </Text>
      <Text style={styles.cardMeta}>
        {item.activityTime} · {item.participantHint}
      </Text>
    </Pressable>
  );

  const renderMessage = (item: MessagePreview) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate("Invitations")}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.timeLabel}>{item.timestampLabel}</Text>
      </View>
      <Text style={styles.cardCopy}>{item.preview}</Text>
      {item.unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount} 条未读</Text>
        </View>
      ) : null}
    </Pressable>
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEyebrow}>USport / 消息工作区</Text>
        <Text style={styles.emptyTitle}>登录后查看你的消息工作区</Text>
        <Text style={styles.emptyText}>
          邀约、活动进度和履约提醒都会汇总到这里，帮助你更稳地成局。
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryButtonText}>去登录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadWorkspace(true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 消息工作区</Text>
        <Text style={styles.title}>
          把邀约、进度提醒和关键消息收进一个稳定入口
        </Text>
        <Text style={styles.subtitle}>
          这里优先展示真正影响成局和履约的消息，而不是做一个泛聊天列表。
        </Text>
        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{workspace.pendingCount}</Text>
            <Text style={styles.metricLabel}>待处理邀约</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{workspace.unreadCount}</Text>
            <Text style={styles.metricLabel}>未读提醒</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={usportColors.brandPrimary} />
          <Text style={styles.loadingText}>正在同步消息工作区...</Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <SectionHeader
              title="待处理邀约"
              subtitle="优先处理仍会影响你本周运动安排的邀约。"
            />
            <View style={styles.list}>
              {workspace.invitations.length ? (
                workspace.invitations.map(renderInvitation)
              ) : (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>还没有新的邀约</Text>
                  <Text style={styles.cardCopy}>
                    后续别人邀请你加入活动时，会优先出现在这里。
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="最近消息"
              subtitle="汇总邀约状态变化和活动提醒。"
            />
            <View style={styles.list}>
              {workspace.messages.length ? (
                workspace.messages.map(renderMessage)
              ) : (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>还没有新的消息</Text>
                  <Text style={styles.cardCopy}>
                    等你收到邀约和活动更新后，这里会逐步形成稳定消息流。
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: usportColors.pageBackground },
  content: {
    padding: usportSpacing.xl,
    paddingBottom: usportSpacing["4xl"],
    gap: usportSpacing.xl,
  },
  hero: {
    gap: usportSpacing.md,
    padding: usportSpacing["2xl"],
    borderRadius: usportRadius.xl,
    backgroundColor: usportColors.pageBackgroundElevated,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  eyebrow: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h1,
    fontWeight: "800",
    lineHeight: 38,
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  metrics: { gap: usportSpacing.md },
  metricCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.xs,
  },
  metricValue: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  metricLabel: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  section: { gap: usportSpacing.lg },
  list: { gap: usportSpacing.md },
  card: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
    shadowColor: usportColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.95,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  cardBody: { flex: 1, gap: usportSpacing.xs },
  cardTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  cardMeta: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  cardCopy: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  statusBadge: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "800",
  },
  timeLabel: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  unreadBadge: {
    alignSelf: "flex-start",
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandSecondary,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  unreadText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "800",
  },
  loadingCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    alignItems: "center",
    gap: usportSpacing.md,
  },
  loadingText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    gap: usportSpacing.lg,
    padding: usportSpacing["3xl"],
    backgroundColor: usportColors.pageBackground,
  },
  emptyEyebrow: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
    lineHeight: 32,
  },
  emptyText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: usportSpacing.xl,
  },
  primaryButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
  },
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "800",
  },
});
