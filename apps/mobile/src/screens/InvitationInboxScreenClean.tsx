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
  usportRadius,
  usportSpacing,
  usportTypography,
  type InvitationItem,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { invitationApi } from "../services/invitation";

type Props = NativeStackScreenProps<RootStackParamList, "Invitations">;

export default function InvitationInboxScreenClean({ navigation }: Props) {
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
      // 接受邀约时后端会同步尝试锁定席位，避免端上和活动状态各走一套规则。
      await invitationApi.respond(item.id, action);
      await loadItems(true);
    } catch (error: unknown) {
      Alert.alert(
        action === "accept" ? "接受失败" : "拒绝失败",
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
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 我的邀约</Text>
        <Text style={styles.title}>把值得优先回应的邀约先处理掉</Text>
        <Text style={styles.subtitle}>
          邀约不是泛聊天入口，而是更高转化率的成局前置信号。
        </Text>
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="邀约列表"
          subtitle="优先处理待回应邀约，能更快把稳定搭子关系沉淀下来。"
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
              后续别人邀请你加入活动，或你被主办方重点筛中时，会统一出现在这里。
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.card}
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
                      style={styles.ghostButton}
                      onPress={() => void handleRespond(item, "decline")}
                      disabled={handlingId === item.id}
                    >
                      <Text style={styles.ghostButtonText}>
                        {handlingId === item.id ? "处理中..." : "婉拒"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.primaryButton}
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
  container: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
  },
  content: {
    padding: usportSpacing.xl,
    paddingBottom: usportSpacing["4xl"],
    gap: usportSpacing.xl,
  },
  hero: {
    gap: usportSpacing.md,
  },
  eyebrow: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
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
  panel: {
    gap: usportSpacing.lg,
  },
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
    lineHeight: 20,
  },
  list: {
    gap: usportSpacing.md,
  },
  card: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    gap: usportSpacing.md,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleWrap: {
    flex: 1,
    gap: usportSpacing.xs,
  },
  cardTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  badge: {
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.mutedBackground,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  badgeText: {
    color: usportColors.textSecondary,
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
  actionRow: {
    flexDirection: "row",
    gap: usportSpacing.md,
  },
  ghostButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
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
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
});
