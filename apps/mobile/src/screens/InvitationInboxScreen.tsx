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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getErrorMessage,
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type InvitationItem,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { invitationApi } from "../services/invitation";

type Props = NativeStackScreenProps<RootStackParamList, "Invitations">;

export default function InvitationInboxScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<InvitationItem[]>([]);
  const [handlingId, setHandlingId] = useState<number | null>(null);

  const loadItems = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextItems = await invitationApi.list();
      setItems(nextItems);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取邀约列表"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const handleRespond = async (
    item: InvitationItem,
    action: "accept" | "decline",
  ) => {
    setHandlingId(item.id);
    try {
      // 接受邀约时由后端统一尝试锁位，避免端上重复维护名额规则。
      await invitationApi.respond(item.id, action);
      await loadItems(true);
      Alert.alert(
        "处理成功",
        action === "accept" ? "已接受邀约" : "已婉拒邀约",
      );
    } catch (error: unknown) {
      Alert.alert(
        action === "accept" ? "接受失败" : "婉拒失败",
        getErrorMessage(error, "请稍后再试"),
      );
    } finally {
      setHandlingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadItems(true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>USport / 我的邀约</Text>
        <Text style={styles.title}>先处理最值得回应的邀约。</Text>
        <Text style={styles.subtitle}>
          邀约不是泛聊天入口，而是成局前最有价值的行动信号。
        </Text>
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="邀约列表"
          subtitle="优先处理待回应邀约，更容易沉淀稳定搭子关系。"
        />

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={usportColors.brandPrimary} />
            <Text style={styles.loadingText}>正在同步邀约...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>还没有新的邀约</Text>
            <Text style={styles.emptyText}>
              当别人邀请你加入活动，或你被主办方重点筛中时，会统一出现在这里。
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("ActivityDetail", {
                    id: String(item.activityId),
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{item.activityTitle}</Text>
                    <Text style={styles.cardSubtitle}>{item.venueLabel}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.statusLabel}</Text>
                  </View>
                </View>

                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.metaText}>
                  {item.senderName} · {item.senderBadge}
                </Text>
                <Text style={styles.metaText}>
                  {item.activityTime} · {item.participantHint}
                </Text>
                <Text style={styles.metaText}>{item.createdAtLabel}</Text>

                {item.canAccept || item.canDecline ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.ghostButton,
                        handlingId === item.id && styles.actionDisabled,
                        pressed && styles.ghostButtonPressed,
                      ]}
                      onPress={() => void handleRespond(item, "decline")}
                      disabled={handlingId === item.id}
                    >
                      <Text style={styles.ghostButtonText}>
                        {handlingId === item.id ? "处理中..." : "婉拒"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryButton,
                        handlingId === item.id && styles.actionDisabled,
                        pressed && styles.primaryButtonPressed,
                      ]}
                      onPress={() => void handleRespond(item, "accept")}
                      disabled={handlingId === item.id}
                    >
                      <Text style={styles.primaryButtonText}>
                        {handlingId === item.id ? "处理中..." : "接受邀约"}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </View>
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
  heroCard: {
    gap: usportSpacing.md,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
    shadowColor: usportColors.shadowStrong,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  eyebrow: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
    lineHeight: 32,
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  panel: { gap: usportSpacing.lg },
  loadingCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: usportSpacing.md,
  },
  loadingText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
  emptyCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  emptyTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  emptyText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
  },
  list: { gap: usportSpacing.md },
  card: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
    shadowColor: usportColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.96,
  },
  cardHeader: {
    flexDirection: "row",
    gap: usportSpacing.md,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleWrap: { flex: 1, gap: usportSpacing.xs },
  cardTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  badge: {
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandSecondary,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  badgeText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  messageText: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  metaText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  actionRow: { flexDirection: "row", gap: usportSpacing.md },
  ghostButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  ghostButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.88,
  },
  ghostButtonText: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    backgroundColor: usportColors.brandPrimaryPressed,
  },
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  actionDisabled: {
    opacity: 0.7,
  },
});
