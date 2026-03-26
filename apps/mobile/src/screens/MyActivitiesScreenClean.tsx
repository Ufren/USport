import React, { useEffect, useMemo, useState } from "react";
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
  type MyActivityItem,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { activityApi } from "../services/activity";

type Props = NativeStackScreenProps<RootStackParamList, "MyActivities">;
type RoleFilter = "all" | "host" | "participant";
type ActivityAction =
  | "cancel-registration"
  | "cancel-activity"
  | "check-in"
  | "finish";

const roleOptions: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "host", label: "我发起的" },
  { value: "participant", label: "我报名的" },
];

function getRoleSummary(role: RoleFilter): string {
  if (role === "host") {
    return "集中查看你发起的活动，方便继续拉人、签到和完赛收口。";
  }
  if (role === "participant") {
    return "统一管理你的报名、候补和即将出发的活动。";
  }
  return "把你发起和参与的活动收进同一个工作区。";
}

function getStatusLabel(item: MyActivityItem): string {
  if (item.role === "host") {
    return item.canFinish ? "待完赛" : "主办方";
  }

  switch (item.registrationStatus) {
    case "waitlisted":
      return "候补中";
    case "checked_in":
      return "已签到";
    case "finished":
      return "已完赛";
    default:
      return "已报名";
  }
}

function getActionConfig(item: MyActivityItem): {
  action: ActivityAction;
  label: string;
  success: string;
  title: string;
  message: string;
} | null {
  if (item.canFinish) {
    return {
      action: "finish",
      label: "完赛收口",
      success: "活动已完赛",
      title: "完赛确认",
      message: `确定将「${item.title}」标记为已完赛吗？系统会同步收口参与者状态。`,
    };
  }

  if (item.canCheckIn) {
    return {
      action: "check-in",
      label: "立即签到",
      success: "签到成功",
      title: "活动签到",
      message: `确定为「${item.title}」完成签到吗？签到后会进入履约状态。`,
    };
  }

  if (item.canManage) {
    return {
      action: "cancel-activity",
      label: "取消活动",
      success: "活动已取消",
      title: "取消活动",
      message: `确定取消「${item.title}」吗？已报名和候补用户都会收到取消结果。`,
    };
  }

  if (item.canCancel) {
    return {
      action: "cancel-registration",
      label: "退出活动",
      success: "已退出活动",
      title: "退出活动",
      message: `确定退出「${item.title}」吗？释放出的名额会自动补给候补用户。`,
    };
  }

  return null;
}

export default function MyActivitiesScreenClean({ navigation }: Props) {
  const [role, setRole] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<MyActivityItem[]>([]);
  const [actingId, setActingId] = useState<number | null>(null);

  const roleSummary = useMemo(() => getRoleSummary(role), [role]);

  const loadItems = async (nextRole: RoleFilter = role, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextItems = await activityApi.mine(nextRole);
      setItems(nextItems);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取活动列表"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadItems(role);
  }, [role]);

  const runAction = async (item: MyActivityItem, action: ActivityAction) => {
    switch (action) {
      case "cancel-activity":
        await activityApi.cancelActivity(item.id);
        break;
      case "cancel-registration":
        await activityApi.cancelRegistration(item.id);
        break;
      case "check-in":
        await activityApi.checkIn(item.id);
        break;
      case "finish":
        await activityApi.finish(item.id);
        break;
    }
  };

  const handleAction = (item: MyActivityItem) => {
    const actionConfig = getActionConfig(item);
    if (!actionConfig) {
      return;
    }

    Alert.alert(actionConfig.title, actionConfig.message, [
      { text: "再想想", style: "cancel" },
      {
        text: actionConfig.label,
        style:
          actionConfig.action === "cancel-activity" ||
          actionConfig.action === "cancel-registration"
            ? "destructive"
            : "default",
        onPress: async () => {
          setActingId(item.id);
          try {
            // 统一在活动服务层收口活动生命周期动作，避免页面各自维护一套调用分支。
            await runAction(item, actionConfig.action);
            await loadItems(role, true);
            Alert.alert("操作成功", actionConfig.success);
          } catch (error: unknown) {
            Alert.alert("操作失败", getErrorMessage(error, "请稍后再试"));
          } finally {
            setActingId(null);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadItems(role, true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 我的活动</Text>
        <Text style={styles.title}>把发起、报名、签到和完赛放进一个工作区</Text>
        <Text style={styles.subtitle}>{roleSummary}</Text>
      </View>

      <View style={styles.filterRow}>
        {roleOptions.map((option) => {
          const active = option.value === role;
          return (
            <Pressable
              key={option.value}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setRole(option.value)}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="活动清单"
          subtitle="把活动状态和履约动作放在同一处，后续更适合做信用沉淀。"
        />

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={usportColors.brandPrimary} />
            <Text style={styles.loadingText}>正在同步你的活动...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>还没有匹配到活动</Text>
            <Text style={styles.emptyText}>
              你可以先去发现页报名一场活动，或者直接发起自己的新活动。
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate("CreateActivity")}
            >
              <Text style={styles.primaryButtonText}>发起新活动</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => {
              const actionConfig = getActionConfig(item);

              return (
                <Pressable
                  key={`${item.role}-${item.id}`}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("ActivityDetail", {
                      id: String(item.id),
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {getStatusLabel(item)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaBlock}>
                    <Text style={styles.metaText}>{item.startTimeLabel}</Text>
                    <Text style={styles.metaText}>
                      {item.district} · {item.venueName}
                    </Text>
                    <Text style={styles.metaText}>
                      {item.feeLabel} · {item.participantSummary}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerHint}>
                      {item.attendanceLabel}
                    </Text>
                    {actionConfig ? (
                      <Pressable
                        style={[
                          styles.ghostButton,
                          actingId === item.id && styles.ghostButtonDisabled,
                        ]}
                        onPress={() => handleAction(item)}
                        disabled={actingId === item.id}
                      >
                        <Text style={styles.ghostButtonText}>
                          {actingId === item.id
                            ? "处理中..."
                            : actionConfig.label}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
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
  filterRow: {
    flexDirection: "row",
    gap: usportSpacing.sm,
  },
  filterChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: usportColors.brandSecondary,
    borderColor: usportColors.brandSecondary,
  },
  filterText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  filterTextActive: {
    color: usportColors.textPrimary,
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
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: usportSpacing.xl,
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
  list: {
    gap: usportSpacing.md,
  },
  card: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    gap: usportSpacing.md,
    alignItems: "flex-start",
    justifyContent: "space-between",
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
  metaBlock: {
    gap: usportSpacing.sm,
  },
  metaText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
  },
  cardFooter: {
    flexDirection: "row",
    gap: usportSpacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerHint: {
    flex: 1,
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    lineHeight: 18,
  },
  ghostButton: {
    minHeight: 40,
    paddingHorizontal: usportSpacing.lg,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonDisabled: {
    opacity: 0.7,
  },
  ghostButtonText: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
});
