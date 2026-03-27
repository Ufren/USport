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
import {
  getErrorMessage,
  usportColors,
  usportMotion,
  usportRadius,
  usportSpacing,
  usportTypography,
  type MembershipOrderItem,
  type MembershipPlanItem,
  type SubscriptionSummary,
} from "@usport/shared";

import { SectionHeader } from "../components/common/SectionHeader";
import { membershipApi } from "../services/membership";

type PageState = {
  plans: MembershipPlanItem[];
  summary: SubscriptionSummary | null;
  orders: MembershipOrderItem[];
};

const initialState: PageState = {
  plans: [],
  summary: null,
  orders: [],
};

export default function MembershipCenterScreen() {
  const [pageState, setPageState] = useState<PageState>(initialState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  const planNameMap = useMemo(
    () => new Map(pageState.plans.map((item) => [item.code, item.name])),
    [pageState.plans],
  );

  const loadPage = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [plans, summary, orders] = await Promise.all([
        membershipApi.plans(),
        membershipApi.summary(),
        membershipApi.orders(),
      ]);

      setPageState({ plans, summary, orders });
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法同步会员信息"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const handleMockPay = async (orderId: number) => {
    setPayingOrderId(orderId);
    try {
      await membershipApi.mockPayOrder(orderId);
      Alert.alert("支付成功", "会员权益已生效，推荐和曝光优先级已经更新。");
      await loadPage(true);
    } catch (error: unknown) {
      Alert.alert("支付失败", getErrorMessage(error, "请稍后再试"));
    } finally {
      setPayingOrderId(null);
    }
  };

  const handlePurchase = async (planCode: string) => {
    setSubmittingPlan(planCode);
    try {
      const order = await membershipApi.createOrder({ planCode });
      Alert.alert("订单已创建", "是否现在完成模拟支付，立即开通会员权益？", [
        { text: "稍后支付", style: "cancel" },
        {
          text: "立即支付",
          onPress: () => void handleMockPay(order.id),
        },
      ]);
      await loadPage(true);
    } catch (error: unknown) {
      Alert.alert("下单失败", getErrorMessage(error, "请稍后再试"));
    } finally {
      setSubmittingPlan(null);
    }
  };

  if (loading && !pageState.summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={usportColors.brandPrimary} />
        <Text style={styles.loadingText}>正在同步会员中心...</Text>
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
        <Text style={styles.eyebrow}>USport / 会员中心</Text>
        <Text style={styles.title}>
          把曝光、推荐和组局效率收进一套透明的权益里。
        </Text>
        <Text style={styles.subtitle}>
          我们先把权益说明、支付状态和订单回流做清楚，再逐步接入真实支付网关。
        </Text>
      </View>

      {pageState.summary ? (
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}>
            <View style={styles.summaryMain}>
              <Text style={styles.summaryBadge}>
                {pageState.summary.isMember ? "会员有效中" : "未开通会员"}
              </Text>
              <Text style={styles.summaryTitle}>
                {pageState.summary.planName ?? "标准账户"}
              </Text>
              <Text style={styles.summaryHint}>
                {pageState.summary.statusLabel}
              </Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>
                {pageState.summary.isMember ? "已生效" : "可升级"}
              </Text>
            </View>
          </View>
          {pageState.summary.expireAtLabel ? (
            <Text style={styles.summaryMeta}>
              有效期至 {pageState.summary.expireAtLabel}
            </Text>
          ) : null}
          <View style={styles.benefitStack}>
            <Text style={styles.benefitLine}>
              {pageState.summary.exposureBoost}
            </Text>
            <Text style={styles.benefitLine}>
              {pageState.summary.filterUnlocks}
            </Text>
            <Text style={styles.benefitLine}>
              {pageState.summary.recommendationPriority}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="可选套餐"
          subtitle="权益文案必须简洁直白，用户不需要读很久才能做决定。"
        />
        <View style={styles.stack}>
          {pageState.plans.map((item) => (
            <View key={item.code} style={styles.planCard}>
              <View style={styles.rowBetween}>
                <View style={styles.planMain}>
                  <Text style={styles.planTitle}>{item.name}</Text>
                  <Text style={styles.planDuration}>{item.durationLabel}</Text>
                </View>
                <Text style={styles.planPrice}>{item.priceLabel}</Text>
              </View>
              <Text style={styles.planDescription}>{item.description}</Text>
              <View style={styles.benefitStack}>
                {item.benefits.map((benefit) => (
                  <Text key={benefit} style={styles.benefitLine}>
                    {benefit}
                  </Text>
                ))}
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  submittingPlan === item.code && styles.buttonDisabled,
                  pressed && styles.primaryButtonPressed,
                ]}
                onPress={() => void handlePurchase(item.code)}
                disabled={submittingPlan !== null || payingOrderId !== null}
              >
                <Text style={styles.primaryButtonText}>
                  {submittingPlan === item.code
                    ? "正在创建订单..."
                    : "创建订单"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="最近订单"
          subtitle="把待支付、已支付和退款状态完整反馈给用户。"
        />
        <View style={styles.stack}>
          {pageState.orders.length ? (
            pageState.orders.map((item) => (
              <View key={item.id} style={styles.orderCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.orderTitle}>
                    {planNameMap.get(item.planCode) ?? item.planCode}
                  </Text>
                  <Text style={styles.orderStatus}>{item.statusLabel}</Text>
                </View>
                <Text style={styles.orderMeta}>{item.amountLabel}</Text>
                <Text style={styles.orderMeta}>{item.createdAt}</Text>
                {item.canPay ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      payingOrderId === item.id && styles.buttonDisabled,
                      pressed && styles.secondaryButtonPressed,
                    ]}
                    onPress={() => void handleMockPay(item.id)}
                    disabled={payingOrderId !== null}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {payingOrderId === item.id ? "正在支付..." : "立即支付"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.orderCard}>
              <Text style={styles.orderMeta}>还没有会员订单记录。</Text>
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
  summaryCard: {
    gap: usportSpacing.md,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
    alignItems: "flex-start",
  },
  summaryMain: {
    flex: 1,
    gap: usportSpacing.xs,
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
  summaryPill: {
    paddingHorizontal: usportSpacing.md,
    paddingVertical: usportSpacing.sm,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandSecondary,
  },
  summaryPillText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  summaryMeta: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  benefitStack: {
    gap: usportSpacing.sm,
  },
  benefitLine: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
  },
  section: { gap: usportSpacing.lg },
  stack: { gap: usportSpacing.md },
  planCard: {
    gap: usportSpacing.md,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
  },
  planMain: {
    flex: 1,
    gap: usportSpacing.xs,
  },
  planTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "800",
  },
  planDuration: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  planPrice: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  planDescription: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 22,
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
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  orderCard: {
    gap: usportSpacing.sm,
    padding: usportSpacing.xl,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    backgroundColor: usportColors.cardBackground,
  },
  orderTitle: {
    flex: 1,
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
  secondaryButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.brandPrimary,
    backgroundColor: usportColors.cardBackgroundStrong,
  },
  secondaryButtonPressed: {
    transform: [{ scale: usportMotion.pressScale }],
    opacity: 0.88,
  },
  secondaryButtonText: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
});
