import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  createActivityDistrictOptions,
  createActivityFeeOptions,
  createActivityJoinRuleOptions,
  createActivitySportOptions,
  createActivityVisibilityOptions,
  getErrorMessage,
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type CreateActivityFormDraft,
  type CreateActivityOption,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { activityApi } from "../services/activity";
import { useUserStore } from "../store/userStore";

type Props = NativeStackScreenProps<RootStackParamList, "CreateActivity">;

const initialDraft: CreateActivityFormDraft = {
  sportCode: "badminton",
  title: "",
  description: "",
  date: "2026-03-26",
  startTime: "19:30",
  endTime: "21:00",
  deadlineTime: "18:30",
  district: "浦东新区",
  venueName: "",
  capacity: 8,
  waitlistCapacity: 2,
  feeType: "aa",
  feeAmount: "48",
  joinRule: "direct",
  visibility: "public",
};

export default function CreateActivityScreen({ navigation }: Props) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [draft, setDraft] = useState<CreateActivityFormDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);

  const feeAmountEditable = useMemo(
    () => draft.feeType !== "free",
    [draft.feeType],
  );

  const previewFee = useMemo(() => {
    if (draft.feeType === "free") {
      return "免费参与";
    }

    if (draft.feeType === "aa") {
      return `AA 分摊，预计 ${draft.feeAmount || "0"} 元`;
    }

    return `固定费用 ${draft.feeAmount || "0"} 元`;
  }, [draft.feeAmount, draft.feeType]);

  const updateDraft = <K extends keyof CreateActivityFormDraft>(
    key: K,
    value: CreateActivityFormDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async () => {
    if (!isLoggedIn) {
      Alert.alert("请先登录", "登录后才能发起活动。", [
        { text: "取消", style: "cancel" },
        { text: "去登录", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (!draft.title.trim() || !draft.venueName.trim()) {
      Alert.alert("信息未完成", "请先填写活动标题和场馆名称。");
      return;
    }

    setSubmitting(true);
    try {
      const detail = await activityApi.create(draft);
      navigation.replace("ActivityDetail", { id: detail.id });
    } catch (error: unknown) {
      Alert.alert("发布失败", getErrorMessage(error, "请检查参数后重试"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>USport / 发起活动</Text>
        <Text style={styles.title}>把一场能顺利成局的活动写清楚。</Text>
        <Text style={styles.subtitle}>
          标题、时间、场馆和门槛描述越明确，后续的报名质量和到场率就越稳定。
        </Text>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>实时预览</Text>
        <Text style={styles.previewTitle}>
          {draft.title.trim() || "给这场活动起一个让人一眼看懂的标题"}
        </Text>
        <Text style={styles.previewMeta}>
          {draft.date} · {draft.startTime} - {draft.endTime} · {draft.district}
        </Text>
        <Text style={styles.previewMeta}>
          {previewFee} · 正式名额 {draft.capacity} 人
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="运动类型"
          subtitle="先决定这场局的基本玩法和人群预期。"
        />
        <OptionGroup
          options={createActivitySportOptions}
          value={draft.sportCode}
          onChange={(value) => updateDraft("sportCode", value)}
        />
      </View>

      <View style={styles.formCard}>
        <FieldLabel label="活动标题" />
        <TextInput
          value={draft.title}
          onChangeText={(value) => updateDraft("title", value)}
          placeholder="例如：今晚 8 人羽毛球友好局"
          placeholderTextColor={usportColors.textTertiary}
          style={styles.input}
        />

        <FieldLabel label="活动描述" />
        <TextInput
          value={draft.description}
          onChangeText={(value) => updateDraft("description", value)}
          placeholder="写清适合谁、强度如何、是否欢迎单人报名。"
          placeholderTextColor={usportColors.textTertiary}
          style={[styles.input, styles.multilineInput]}
          multiline
        />

        <FieldLabel label="场馆名称" />
        <TextInput
          value={draft.venueName}
          onChangeText={(value) => updateDraft("venueName", value)}
          placeholder="例如：源深体育馆 3 号场"
          placeholderTextColor={usportColors.textTertiary}
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="区域与时间"
          subtitle="这几个字段最直接影响成局效率。"
        />
        <OptionGroup
          options={createActivityDistrictOptions}
          value={draft.district}
          onChange={(value) => updateDraft("district", value)}
        />

        <View style={styles.formCard}>
          <FieldLabel label="活动日期" />
          <TextInput
            value={draft.date}
            onChangeText={(value) => updateDraft("date", value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={usportColors.textTertiary}
            style={styles.input}
          />

          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <FieldLabel label="开始时间" />
              <TextInput
                value={draft.startTime}
                onChangeText={(value) => updateDraft("startTime", value)}
                placeholder="19:30"
                placeholderTextColor={usportColors.textTertiary}
                style={styles.input}
              />
            </View>
            <View style={styles.inlineField}>
              <FieldLabel label="结束时间" />
              <TextInput
                value={draft.endTime}
                onChangeText={(value) => updateDraft("endTime", value)}
                placeholder="21:00"
                placeholderTextColor={usportColors.textTertiary}
                style={styles.input}
              />
            </View>
          </View>

          <FieldLabel label="报名截止" />
          <TextInput
            value={draft.deadlineTime}
            onChangeText={(value) => updateDraft("deadlineTime", value)}
            placeholder="18:30"
            placeholderTextColor={usportColors.textTertiary}
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="人数与费用"
          subtitle="规则越直白，报名决策越轻。"
        />
        <View style={styles.formCard}>
          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <FieldLabel label="正式名额" />
              <TextInput
                value={String(draft.capacity)}
                onChangeText={(value) =>
                  updateDraft(
                    "capacity",
                    Number.parseInt(value || "0", 10) || 0,
                  )
                }
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.inlineField}>
              <FieldLabel label="候补名额" />
              <TextInput
                value={String(draft.waitlistCapacity)}
                onChangeText={(value) =>
                  updateDraft(
                    "waitlistCapacity",
                    Number.parseInt(value || "0", 10) || 0,
                  )
                }
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <OptionGroup
          options={createActivityFeeOptions}
          value={draft.feeType}
          onChange={(value) =>
            updateDraft("feeType", value as CreateActivityFormDraft["feeType"])
          }
        />

        <View style={styles.formCard}>
          <FieldLabel label="参考费用" />
          <TextInput
            value={draft.feeAmount}
            onChangeText={(value) => updateDraft("feeAmount", value)}
            placeholder={feeAmountEditable ? "例如：48" : "免费活动无需填写"}
            placeholderTextColor={usportColors.textTertiary}
            style={[styles.input, !feeAmountEditable && styles.inputDisabled]}
            editable={feeAmountEditable}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="报名规则"
          subtitle="把筛选机制和曝光范围说明白。"
        />
        <OptionGroup
          options={createActivityJoinRuleOptions}
          value={draft.joinRule}
          onChange={(value) =>
            updateDraft(
              "joinRule",
              value as CreateActivityFormDraft["joinRule"],
            )
          }
        />
        <OptionGroup
          options={createActivityVisibilityOptions}
          value={draft.visibility}
          onChange={(value) =>
            updateDraft(
              "visibility",
              value as CreateActivityFormDraft["visibility"],
            )
          }
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          submitting && styles.submitButtonDisabled,
          pressed && styles.submitButtonPressed,
        ]}
        onPress={() => void submit()}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "正在发布..." : "发布活动"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function OptionGroup({
  options,
  value,
  onChange,
}: {
  options: CreateActivityOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.optionGroup}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.optionCard,
              active && styles.optionCardActive,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[styles.optionTitle, active && styles.optionTitleActive]}
            >
              {option.label}
            </Text>
            <Text
              style={[styles.optionText, active && styles.optionTextActive]}
            >
              {option.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  previewCard: {
    gap: usportSpacing.sm,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  previewLabel: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  previewTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
    lineHeight: 24,
  },
  previewMeta: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
  },
  section: { gap: usportSpacing.lg },
  optionGroup: { gap: usportSpacing.md },
  optionCard: {
    gap: usportSpacing.xs,
    padding: usportSpacing.lg,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
  },
  optionCardActive: {
    borderColor: usportColors.brandPrimary,
    backgroundColor: usportColors.brandSecondary,
  },
  optionCardPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.92,
  },
  optionTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  optionTitleActive: {
    color: usportColors.brandPrimary,
  },
  optionText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  optionTextActive: {
    color: usportColors.textSecondary,
  },
  formCard: {
    gap: usportSpacing.md,
    padding: usportSpacing.lg,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
  },
  fieldLabel: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  input: {
    minHeight: 50,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.md,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.pageBackgroundElevated,
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
  },
  multilineInput: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  inputDisabled: {
    opacity: 0.55,
  },
  inlineRow: {
    flexDirection: "row",
    gap: usportSpacing.md,
  },
  inlineField: {
    flex: 1,
    gap: usportSpacing.sm,
  },
  submitButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
  },
  submitButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    backgroundColor: usportColors.brandPrimaryPressed,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
