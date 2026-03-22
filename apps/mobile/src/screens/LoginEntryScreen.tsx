import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  getErrorMessage,
  loginValuePoints,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { userApi } from "../services/user";
import { useUserStore } from "../store/userStore";
import { persistSession } from "../utils/storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginEntryScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const hydrateSession = useUserStore((state) => state.hydrateSession);

  const completeLogin = async (mode: "wechat" | "phone") => {
    if (!agreementAccepted) {
      Alert.alert("请先同意协议", "继续登录前，请先同意用户协议与隐私政策。");
      return;
    }

    setLoading(true);

    try {
      const result =
        mode === "wechat"
          ? await userApi.wechatLogin("mock-code-for-rn")
          : await userApi.phoneLogin("mock-phone-code");

      // 登录成功后同时同步本地缓存和内存状态，避免页面间状态不一致。
      await persistSession(result.token, result.user);
      hydrateSession({ token: result.token, userInfo: result.user });
      navigation.goBack();
    } catch (error: unknown) {
      Alert.alert("登录失败", getErrorMessage(error, "请稍后重试"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 真实成局优先</Text>
        <Text style={styles.title}>先找到今晚真正能一起运动的人。</Text>
        <Text style={styles.subtitle}>
          不是泛社交，也不是场馆黄页。我们先把搭子、场地和时段拼成一局。
        </Text>
      </View>

      <View style={styles.pointList}>
        {loginValuePoints.map((point) => (
          <View key={point.id} style={styles.pointCard}>
            <Text style={styles.pointTitle}>{point.title}</Text>
            <Text style={styles.pointText}>{point.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionPanel}>
        <Pressable
          style={[
            styles.primaryButton,
            (!agreementAccepted || loading) && styles.buttonDisabled,
          ]}
          onPress={() => void completeLogin("wechat")}
          disabled={!agreementAccepted || loading}
        >
          {loading ? (
            <ActivityIndicator color={usportColors.textInverse} />
          ) : (
            <Text style={styles.primaryButtonText}>微信一键登录</Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            (!agreementAccepted || loading) && styles.secondaryButtonDisabled,
          ]}
          onPress={() => void completeLogin("phone")}
          disabled={!agreementAccepted || loading}
        >
          <Text style={styles.secondaryButtonText}>手机号登录</Text>
        </Pressable>

        <Pressable
          style={styles.agreementRow}
          onPress={() => setAgreementAccepted((value) => !value)}
        >
          <View
            style={[
              styles.checkbox,
              agreementAccepted && styles.checkboxChecked,
            ]}
          >
            {agreementAccepted ? (
              <Text style={styles.checkboxMark}>✓</Text>
            ) : null}
          </View>
          <Text style={styles.agreementText}>
            我已阅读并同意《用户协议》与《隐私政策》
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing["4xl"],
    gap: usportSpacing["2xl"],
  },
  hero: {
    gap: usportSpacing.lg,
  },
  eyebrow: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.hero,
    fontWeight: "800",
    lineHeight: 40,
  },
  subtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  pointList: {
    gap: usportSpacing.md,
  },
  pointCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  pointTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
  },
  pointText: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  actionPanel: {
    marginTop: "auto",
    gap: usportSpacing.md,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.pill,
  },
  primaryButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.pill,
    borderWidth: 1,
    borderColor: usportColors.borderStrong,
  },
  secondaryButtonText: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  buttonDisabled: {
    backgroundColor: usportColors.borderStrong,
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: usportSpacing.md,
    paddingTop: usportSpacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: usportRadius.sm,
    borderWidth: 1,
    borderColor: usportColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: usportColors.cardBackground,
  },
  checkboxChecked: {
    backgroundColor: usportColors.brandPrimary,
    borderColor: usportColors.brandPrimary,
  },
  checkboxMark: {
    color: usportColors.textInverse,
    fontSize: usportTypography.caption,
    fontWeight: "800",
  },
  agreementText: {
    flex: 1,
    color: usportColors.textSecondary,
    fontSize: usportTypography.caption,
    lineHeight: 18,
  },
});
