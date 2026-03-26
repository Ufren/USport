import React, { useEffect, useState } from "react";
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
  usportRadius,
  usportSpacing,
  usportTypography,
  type CreditSummary,
  type ReportItem,
} from "@usport/shared";

import { SectionHeader } from "../components/common/SectionHeader";
import { governanceApi } from "../services/governance";

const reasonOptions = [
  { value: "host_no_show", label: "主办方失约" },
  { value: "spam_invite", label: "骚扰邀约" },
  { value: "unsafe_behavior", label: "不安全行为" },
] as const;

export default function CreditCenterScreenClean() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reasonCode, setReasonCode] =
    useState<(typeof reasonOptions)[number]["value"]>("host_no_show");
  const [description, setDescription] = useState("");

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
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取信用信息"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await governanceApi.createReport({
        targetType: "activity",
        targetId: 1001,
        reasonCode,
        description,
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
        <Text style={styles.loadingText}>正在同步信用工作区...</Text>
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
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 信用与履约</Text>
        <Text style={styles.title}>把履约、风险和举报处理收在一个工作区</Text>
        <Text style={styles.subtitle}>
          信用分会真实影响推荐、邀约通过率和活动曝光，所以它必须清晰、可解释、可申诉。
        </Text>
      </View>

      {summary ? (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{summary.score}</Text>
          <Text style={styles.scoreLevel}>{summary.levelLabel}</Text>
          <Text style={styles.scoreHint}>{summary.improvementSuggestion}</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricText}>
              稳定记录 {summary.positiveCount}
            </Text>
            <Text style={styles.metricText}>风险记录 {summary.riskCount}</Text>
            <Text style={styles.metricText}>
              履约率 {summary.completionRate}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="最近信用记录"
          subtitle="让用户知道自己的信用变化来自哪些行为。"
        />
        <View style={styles.cardList}>
          {summary?.recentRecords.length ? (
            summary.recentRecords.map((item) => (
              <View key={item.id} style={styles.recordCard}>
                <View style={styles.recordTop}>
                  <Text style={styles.recordLabel}>{item.label}</Text>
                  <Text
                    style={[
                      styles.recordDelta,
                      item.delta >= 0
                        ? styles.deltaPositive
                        : styles.deltaNegative,
                    ]}
                  >
                    {item.delta >= 0 ? `+${item.delta}` : item.delta}
                  </Text>
                </View>
                <Text style={styles.recordDescription}>{item.description}</Text>
                <Text style={styles.recordTime}>{item.createdAt}</Text>
              </View>
            ))
          ) : (
            <View style={styles.recordCard}>
              <Text style={styles.recordDescription}>
                当前还没有信用变化记录。
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="提交举报"
          subtitle="先提供一个清晰、最小可运营的举报入口。"
        />
        <View style={styles.formCard}>
          <View style={styles.reasonRow}>
            {reasonOptions.map((item) => {
              const active = item.value === reasonCode;
              return (
                <Pressable
                  key={item.value}
                  style={[styles.reasonChip, active && styles.reasonChipActive]}
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
            placeholder="补充现场情况、时间点以及你观察到的问题。"
            placeholderTextColor={usportColors.textTertiary}
          />
          <Pressable
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={() => void handleSubmit()}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "提交中..." : "提交举报"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="我的举报"
          subtitle="让举报人知道自己的工单没有石沉大海。"
        />
        <View style={styles.cardList}>
          {reports.length ? (
            reports.map((item) => (
              <View key={item.id} style={styles.reportCard}>
                <View style={styles.recordTop}>
                  <Text style={styles.recordLabel}>{item.reasonCode}</Text>
                  <Text style={styles.reportStatus}>{item.statusLabel}</Text>
                </View>
                <Text style={styles.recordDescription}>{item.description}</Text>
                <Text style={styles.recordTime}>{item.createdAtLabel}</Text>
              </View>
            ))
          ) : (
            <View style={styles.reportCard}>
              <Text style={styles.recordDescription}>你还没有提交过举报。</Text>
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
  hero: { gap: usportSpacing.md },
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
  scoreCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  scoreValue: {
    color: usportColors.textPrimary,
    fontSize: 44,
    fontWeight: "800",
  },
  scoreLevel: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  scoreHint: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  metricRow: { gap: usportSpacing.xs },
  metricText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  section: { gap: usportSpacing.lg },
  cardList: { gap: usportSpacing.md },
  recordCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  reportCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  recordTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  recordLabel: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  recordDelta: { fontSize: usportTypography.bodySm, fontWeight: "700" },
  deltaPositive: { color: usportColors.success },
  deltaNegative: { color: usportColors.danger },
  recordDescription: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  recordTime: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  reportStatus: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.lg,
  },
  reasonRow: { flexDirection: "row", flexWrap: "wrap", gap: usportSpacing.sm },
  reasonChip: {
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.border,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
  },
  reasonChipActive: {
    backgroundColor: usportColors.brandSecondary,
    borderColor: usportColors.brandSecondary,
  },
  reasonText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  reasonTextActive: { color: usportColors.textPrimary },
  textarea: {
    minHeight: 108,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.lg,
    color: usportColors.textPrimary,
    textAlignVertical: "top",
  },
  submitButton: {
    minHeight: 48,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
