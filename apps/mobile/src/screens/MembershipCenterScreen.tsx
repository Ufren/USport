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
import {
  getErrorMessage,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
  type MembershipOrderItem,
  type MembershipPlanItem,
  type SubscriptionSummary,
} from "@usport/shared";

import { SectionHeader } from "../components/common/SectionHeader";
import { membershipApi } from "../services/membership";

export default function MembershipCenterScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<MembershipPlanItem[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [orders, setOrders] = useState<MembershipOrderItem[]>([]);

  const loadPage = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [nextPlans, nextSummary, nextOrders] = await Promise.all([
        membershipApi.plans(),
        membershipApi.summary(),
        membershipApi.orders(),
      ]);
      setPlans(nextPlans);
      setSummary(nextSummary);
      setOrders(nextOrders);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取会员信息"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const handlePurchase = async (planCode: string) => {
    setSubmittingPlan(planCode);
    try {
      await membershipApi.createOrder({ planCode });
      Alert.alert("开通成功", "会员权益已经生效，你的推荐与曝光能力已更新。");
      await loadPage(true);
    } catch (error: unknown) {
      Alert.alert("开通失败", getErrorMessage(error, "稍后再试一次"));
    } finally {
      setSubmittingPlan(null);
    }
  };

  if (loading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={usportColors.brandPrimary} />
        <Text style={styles.loadingText}>正在同步会员工作区...</Text>
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
        <Text style={styles.eyebrow}>USport / 会员中心</Text>
        <Text style={styles.title}>
          把曝光、推荐和高阶筛选集中为一套稳定权益
        </Text>
        <Text style={styles.subtitle}>
          会员不是炫耀身份，而是让稳定履约、频繁组局和长期找搭子的用户，获得更高效的成局体验。
        </Text>
      </View>

      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryBadge}>
            {summary.isMember ? "会员有效中" : "未开通会员"}
          </Text>
          <Text style={styles.summaryTitle}>
            {summary.planName ?? "标准账户"}
          </Text>
          <Text style={styles.summaryHint}>{summary.statusLabel}</Text>
          {summary.expireAtLabel ? (
            <Text style={styles.summaryMeta}>
              有效期至 {summary.expireAtLabel}
            </Text>
          ) : null}
          <View style={styles.summaryList}>
            <Text style={styles.summaryListItem}>{summary.exposureBoost}</Text>
            <Text style={styles.summaryListItem}>{summary.filterUnlocks}</Text>
            <Text style={styles.summaryListItem}>
              {summary.recommendationPriority}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="可选套餐"
          subtitle="先用少量、明确、可理解的权益打磨付费体验。"
        />
        <View style={styles.cardList}>
          {plans.map((item) => (
            <View key={item.code} style={styles.planCard}>
              <Text style={styles.planTitle}>{item.name}</Text>
              <Text style={styles.planPrice}>{item.priceLabel}</Text>
              <Text style={styles.planDescription}>{item.description}</Text>
              <View style={styles.benefitList}>
                {item.benefits.map((benefit) => (
                  <Text key={benefit} style={styles.benefitItem}>
                    {`• ${benefit}`}
                  </Text>
                ))}
              </View>
              <Pressable
                style={[
                  styles.primaryButton,
                  submittingPlan === item.code && styles.buttonDisabled,
                ]}
                onPress={() => void handlePurchase(item.code)}
                disabled={submittingPlan !== null}
              >
                <Text style={styles.primaryButtonText}>
                  {submittingPlan === item.code ? "正在开通..." : "立即开通"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="最近订单"
          subtitle="让用户能看清自己的付费记录和当前状态。"
        />
        <View style={styles.cardList}>
          {orders.length ? (
            orders.map((item) => (
              <View key={item.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderTitle}>{item.planCode}</Text>
                  <Text style={styles.orderStatus}>{item.statusLabel}</Text>
                </View>
                <Text style={styles.orderMeta}>{item.amountLabel}</Text>
                <Text style={styles.orderMeta}>{item.createdAt}</Text>
              </View>
            ))
          ) : (
            <View style={styles.orderCard}>
              <Text style={styles.orderMeta}>你还没有会员订单记录。</Text>
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
  summaryCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  summaryBadge: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  summaryTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  summaryHint: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
  summaryMeta: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  summaryList: { gap: usportSpacing.xs },
  summaryListItem: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  section: { gap: usportSpacing.lg },
  cardList: { gap: usportSpacing.md },
  planCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  planTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  planPrice: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  planDescription: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  benefitList: { gap: usportSpacing.xs },
  benefitItem: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.bodySm,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  buttonDisabled: { opacity: 0.7 },
  orderCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  orderTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  orderStatus: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  orderMeta: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
});
