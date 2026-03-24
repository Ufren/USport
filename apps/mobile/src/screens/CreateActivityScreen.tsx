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
      Alert.alert("请先登录", "登录后才能发布活动。", [
        { text: "取消", style: "cancel" },
        { text: "去登录", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (!draft.title.trim() || !draft.venueName.trim()) {
      Alert.alert("信息不完整", "请先填写活动标题和场馆名称。");
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
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 发起活动</Text>
        <Text style={styles.title}>把成局需要的信息一次说清楚。</Text>
        <Text style={styles.subtitle}>
          标题、时间、场馆和门槛描述越准确，后续的报名质量和到场率越高。
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title="运动类型" subtitle="先确定这一局的核心玩法。" />
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
          placeholder="写清楚适合谁、强度和集合方式"
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
        <SectionHeader title="区域与时间" subtitle="把最影响转化的字段收紧。" />
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
          title="名额与收费"
          subtitle="这些规则会直接决定报名门槛。"
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
        <SectionHeader title="可见范围" subtitle="让优质报名尽量前置发生。" />
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
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={() => void submit()}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "发布中..." : "发布活动"}
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
            style={[styles.optionCard, active && styles.optionCardActive]}
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
  section: {
    gap: usportSpacing.lg,
  },
  optionGroup: {
    gap: usportSpacing.md,
  },
  optionCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.lg,
    gap: usportSpacing.xs,
  },
  optionCardActive: {
    borderColor: usportColors.brandPrimary,
    backgroundColor: usportColors.successSoft,
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
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.lg,
    gap: usportSpacing.md,
  },
  fieldLabel: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  input: {
    minHeight: 48,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.pageBackground,
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.md,
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
    borderRadius: usportRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: usportColors.brandPrimary,
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
