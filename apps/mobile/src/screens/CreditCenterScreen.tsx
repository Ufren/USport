import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getErrorMessage,
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type CreditSummary,
  type ReportItem,
} from "@usport/shared";

import { SectionHeader } from "../components/common/SectionHeader";
import { governanceApi } from "../services/governance";

const reasonOptions = [
  { value: "host_no_show", label: "主办方爽约" },
  { value: "spam_invite", label: "骚扰邀约" },
  { value: "unsafe_behavior", label: "存在安全风险" },
] as const;

const reportReasonMap = new Map<string, string>(
  reasonOptions.map((item) => [item.value, item.label]),
);

export default function CreditCenterScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reasonCode, setReasonCode] =
    useState<(typeof reasonOptions)[number]["value"]>("host_no_show");
  const [description, setDescription] = useState("");

  const recentStats = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      `稳定记录 ${summary.positiveCount}`,
      `风险记录 ${summary.riskCount}`,
      `履约率 ${summary.completionRate}`,
    ];
  }, [summary]);

  const loadPage = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [nextSummary, nextReports] = await Promise.all([
        governanceApi.creditSummary(),
        governanceApi.reports(),
      ]);
      setSummary(nextSummary);
      setReports(nextReports);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法同步信用信息"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("请补充说明", "请简要说明现场情况，方便平台更快判断。");
      return;
    }

    setSubmitting(true);
    try {
      await governanceApi.createReport({
        targetType: "activity",
        targetId: 1001,
        reasonCode,
        description: description.trim(),
      });
      setDescription("");
      Alert.alert("提交成功", "举报已进入处理队列，我们会尽快完成审核。");
      await loadPage(true);
    } catch (error: unknown) {
      Alert.alert("提交失败", getErrorMessage(error, "请稍后再试"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={usportColors.brandPrimary} />
        <Text style={styles.loadingText}>正在同步信用中心...</Text>
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
          onRefresh={() => void loadPage(true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>USport / 信用与治理</Text>
        <Text style={styles.title}>
          把履约、风险和举报处理放在同一条清晰链路里。
        </Text>
        <Text style={styles.subtitle}>
          信用分会影响推荐曝光、邀约通过率和组局效率，所以它必须透明、克制、可解释。
        </Text>
      </View>

      {summary ? (
        <View style={styles.scoreCard}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={styles.scoreCaption}>当前信用分</Text>
              <Text style={styles.scoreValue}>{summary.score}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{summary.levelLabel}</Text>
            </View>
          </View>
          <Text style={styles.scoreHint}>{summary.improvementSuggestion}</Text>
          <View style={styles.metricRow}>
            {recentStats.map((item) => (
              <View key={item} style={styles.metricChip}>
                <Text style={styles.metricChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="最近记录"
          subtitle="让用户知道信用变化来自哪些行为，避免平台黑箱感。"
        />
        <View style={styles.stack}>
          {summary?.recentRecords.length ? (
            summary.recentRecords.map((item) => (
              <View key={item.id} style={styles.panel}>
                <View style={styles.rowBetween}>
                  <Text style={styles.panelTitle}>{item.label}</Text>
                  <Text
                    style={[
                      styles.deltaText,
                      item.delta >= 0
                        ? styles.deltaPositive
                        : styles.deltaNegative,
                    ]}
                  >
                    {item.delta >= 0 ? `+${item.delta}` : item.delta}
                  </Text>
                </View>
                <Text style={styles.panelCopy}>{item.description}</Text>
                <Text style={styles.panelMeta}>{item.createdAt}</Text>
              </View>
            ))
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelCopy}>当前还没有信用变化记录。</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="提交举报"
          subtitle="入口尽量简单，但语义和后续反馈要足够明确。"
        />
        <View style={styles.panel}>
          <View style={styles.metricRow}>
            {reasonOptions.map((item) => {
              const active = item.value === reasonCode;
              return (
                <Pressable
                  key={item.value}
                  style={({ pressed }) => [
                    styles.reasonChip,
                    active && styles.reasonChipActive,
                    pressed && styles.reasonChipPressed,
                  ]}
                  onPress={() => setReasonCode(item.value)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      active && styles.reasonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            style={styles.textarea}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="补充现场情况、时间点，以及你观察到的具体问题。"
            placeholderTextColor={usportColors.textTertiary}
          />
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              submitting && styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={() => void handleSubmit()}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? "正在提交..." : "提交举报"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="我的举报"
          subtitle="让用户清楚知道自己的工单没有沉默失踪。"
        />
        <View style={styles.stack}>
          {reports.length ? (
            reports.map((item) => (
              <View key={item.id} style={styles.panel}>
                <View style={styles.rowBetween}>
                  <Text style={styles.panelTitle}>
                    {reportReasonMap.get(item.reasonCode) ?? item.reasonCode}
                  </Text>
                  <Text style={styles.reportStatus}>{item.statusLabel}</Text>
                </View>
                <Text style={styles.panelCopy}>{item.description}</Text>
                <Text style={styles.panelMeta}>{item.createdAtLabel}</Text>
              </View>
            ))
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelCopy}>你还没有提交过举报。</Text>
            </View>
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: usportSpacing.md,
    backgroundColor: usportColors.pageBackground,
  },
  loadingText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
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
  scoreCard: {
    gap: usportSpacing.md,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  scoreTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: usportSpacing.md,
  },
  scoreCaption: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  scoreValue: {
    color: usportColors.textPrimary,
    fontSize: 46,
    fontWeight: "800",
    marginTop: usportSpacing.xs,
  },
  levelBadge: {
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandSecondary,
  },
  levelBadgeText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  scoreHint: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: usportSpacing.sm,
  },
  metricChip: {
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.mutedBackground,
  },
  metricChipText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  section: { gap: usportSpacing.lg },
  stack: { gap: usportSpacing.md },
  panel: {
    gap: usportSpacing.sm,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  panelTitle: {
    flex: 1,
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  deltaText: {
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  deltaPositive: {
    color: usportColors.success,
  },
  deltaNegative: {
    color: usportColors.danger,
  },
  panelCopy: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
  },
  panelMeta: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  reasonChip: {
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  reasonChipActive: {
    borderColor: usportColors.brandPrimary,
    backgroundColor: usportColors.brandSecondary,
  },
  reasonChipPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.9,
  },
  reasonText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  reasonTextActive: {
    color: usportColors.brandPrimary,
  },
  textarea: {
    minHeight: 116,
    paddingHorizontal: usportSpacing.lg,
    paddingVertical: usportSpacing.lg,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.pageBackgroundElevated,
    color: usportColors.textPrimary,
    textAlignVertical: "top",
    fontSize: usportTypography.body,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
  },
  primaryButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    backgroundColor: usportColors.brandPrimaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  reportStatus: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
});
