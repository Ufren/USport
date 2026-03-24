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
  type ExperienceActivityDetail,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { activityApi } from "../services/activity";
import { useUserStore } from "../store/userStore";

type Props = NativeStackScreenProps<RootStackParamList, "ActivityDetail">;

const toneColorMap = {
  success: {
    backgroundColor: usportColors.successSoft,
    color: usportColors.success,
  },
  warning: {
    backgroundColor: usportColors.warningSoft,
    color: usportColors.warning,
  },
  neutral: {
    backgroundColor: usportColors.mutedBackground,
    color: usportColors.textSecondary,
  },
  danger: {
    backgroundColor: usportColors.dangerSoft,
    color: usportColors.danger,
  },
} as const;

export default function ActivityDetailScreen({ navigation, route }: Props) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [detail, setDetail] = useState<ExperienceActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinedStatus, setJoinedStatus] = useState<
    "registered" | "waitlisted" | null
  >(null);

  const toneStyle = useMemo(() => {
    if (!detail) {
      return toneColorMap.neutral;
    }
    return toneColorMap[detail.statusTone.tone];
  }, [detail]);

  const loadDetail = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextDetail = await activityApi.detail(route.params.id);
      setDetail(nextDetail);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取活动详情"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [route.params.id]);

  const handleRegister = async () => {
    if (!detail) {
      return;
    }

    if (!isLoggedIn) {
      Alert.alert("请先登录", "登录后才能报名活动。", [
        { text: "取消", style: "cancel" },
        {
          text: "去登录",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const result = await activityApi.register(detail.id);
      setJoinedStatus(result.status);
      setDetail((current) =>
        current
          ? {
              ...current,
              participantSummary: result.participantSummary,
            }
          : current,
      );
      Alert.alert(
        result.status === "waitlisted" ? "已加入候补" : "报名成功",
        result.status === "waitlisted"
          ? "当前名额已满，你已进入候补队列。"
          : "你已经成功加入这场活动。",
      );
    } catch (error: unknown) {
      Alert.alert("报名失败", getErrorMessage(error, "请稍后再试"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={usportColors.brandPrimary} />
        <Text style={styles.loadingText}>正在加载活动详情...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>活动不存在或已下线。</Text>
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
          onRefresh={() => void loadDetail(true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.coverLabel}>{detail.coverLabel}</Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: toneStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: toneStyle.color }]}>
              {detail.statusTone.label}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.subtitle}>{detail.subtitle}</Text>
        <View style={styles.metaList}>
          <Text style={styles.metaText}>开始时间：{detail.startTimeLabel}</Text>
          <Text style={styles.metaText}>结束时间：{detail.endTimeLabel}</Text>
          <Text style={styles.metaText}>
            报名截止：{detail.signupDeadlineLabel}
          </Text>
          <Text style={styles.metaText}>
            地点：{detail.district} · {detail.venueName}
          </Text>
        </View>
        {detail.riskHint ? (
          <Text style={styles.riskHint}>{detail.riskHint}</Text>
        ) : null}
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="报名概览"
          subtitle="先看成局稳定性，再决定是否加入。"
        />
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{detail.participantSummary}</Text>
          <Text style={styles.infoText}>{detail.feeLabel}</Text>
          <Text style={styles.infoText}>{detail.addressHint}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="主办方"
          subtitle="尽量让你在报名之前就知道这局靠不靠谱。"
        />
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{detail.host.name}</Text>
          <Text style={styles.infoText}>{detail.host.badge}</Text>
          <Text style={styles.infoText}>{detail.host.attendanceLabel}</Text>
          <Text style={styles.infoText}>{detail.host.recentSessionsLabel}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <SectionHeader
          title="活动说明"
          subtitle="范围、门槛和注意事项都写清楚，避免临场误解。"
        />
        <View style={styles.infoCard}>
          <Text style={styles.description}>{detail.description}</Text>
          <View style={styles.tagRow}>
            {detail.suitableCrowd.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.infoText}>
            水平建议：{detail.skillLevelLabel}
          </Text>
          <Text style={styles.infoText}>
            性别规则：{detail.genderRuleLabel}
          </Text>
          {detail.notices.map((notice) => (
            <Text key={notice} style={styles.noticeText}>
              · {notice}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actionPanel}>
        {joinedStatus ? (
          <View style={styles.joinedBanner}>
            <Text style={styles.joinedTitle}>
              {joinedStatus === "waitlisted" ? "你已进入候补" : "你已成功报名"}
            </Text>
            <Text style={styles.joinedText}>{detail.participantSummary}</Text>
          </View>
        ) : null}
        <Pressable
          style={[
            styles.actionButton,
            submitting && styles.actionButtonDisabled,
          ]}
          onPress={() => void handleRegister()}
          disabled={submitting}
        >
          <Text style={styles.actionButtonText}>
            {submitting
              ? "提交中..."
              : detail.allowWaitlist && detail.status === "full"
                ? "加入候补"
                : "立即报名"}
          </Text>
        </Pressable>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: usportSpacing.md,
    backgroundColor: usportColors.pageBackground,
    padding: usportSpacing["3xl"],
  },
  loadingText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
  },
  heroCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
    alignItems: "center",
  },
  coverLabel: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    flex: 1,
  },
  statusPill: {
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.xs,
  },
  statusText: {
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
  metaList: {
    gap: usportSpacing.sm,
  },
  metaText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  riskHint: {
    color: usportColors.brandAccent,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  panel: {
    gap: usportSpacing.lg,
  },
  infoCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  infoTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  infoText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  description: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: usportSpacing.sm,
    marginTop: usportSpacing.sm,
    marginBottom: usportSpacing.sm,
  },
  tagChip: {
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
    backgroundColor: usportColors.mutedBackground,
  },
  tagText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  noticeText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  actionPanel: {
    gap: usportSpacing.md,
  },
  joinedBanner: {
    backgroundColor: usportColors.successSoft,
    borderRadius: usportRadius.md,
    padding: usportSpacing.lg,
    gap: usportSpacing.xs,
  },
  joinedTitle: {
    color: usportColors.success,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  joinedText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
  actionButton: {
    minHeight: 54,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
