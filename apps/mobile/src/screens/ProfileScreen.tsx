import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import {
  getUserDisplayName,
  getUserHandle,
  getUserInitial,
  profileHighlights,
  profileMenuItems,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
} from "@usport/shared";

import type { RootStackParamList } from "../../App";
import { SectionHeader } from "../components/common/SectionHeader";
import { ProfileMenuRow } from "../components/profile/ProfileMenuRow";
import { useUserStore } from "../store/userStore";
import { clearSessionStorage } from "../utils/storage";

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isLoggedIn, userInfo, logout } = useUserStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    userInfo: state.userInfo,
    logout: state.logout,
  }));

  const handleLogout = () => {
    Alert.alert("退出登录", "确定清除当前账号的本地登录状态吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出",
        style: "destructive",
        onPress: async () => {
          await clearSessionStorage();
          logout();
        },
      },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestBrand}>USport</Text>
        <Text style={styles.guestTitle}>
          登录后，运动履约和搭子关系才会开始沉淀。
        </Text>
        <Text style={styles.guestText}>
          你可以先浏览发现页；登录后，我们会记录到场、复约、消息和信用表现。
        </Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>去登录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitial(userInfo)}</Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.nickname}>{getUserDisplayName(userInfo)}</Text>
          <Text style={styles.handle}>{getUserHandle(userInfo)}</Text>
          <Text style={styles.headerHint}>
            你的履约表现会持续影响推荐、邀约通过率和活动曝光。
          </Text>
        </View>
      </View>

      <View style={styles.highlightGrid}>
        {profileHighlights.map((item) => (
          <View key={item.id} style={styles.highlightCard}>
            <Text style={styles.highlightValue}>{item.value}</Text>
            <Text style={styles.highlightLabel}>{item.label}</Text>
            <Text style={styles.highlightHint}>{item.hint}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="账户工作区"
          subtitle="把活动、邀约、信用和会员都放在一个稳定的入口里。"
        />
        <View style={styles.menuGroup}>
          {profileMenuItems.map((item) => (
            <ProfileMenuRow
              key={item.id}
              item={item}
              onPress={() => {
                Alert.alert(
                  "开发中",
                  `${item.title} 将在下一阶段接入真实流程。`,
                );
              }}
            />
          ))}
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </Pressable>
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
    gap: usportSpacing.xl,
    paddingBottom: usportSpacing["4xl"],
  },
  header: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.lg,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    flexDirection: "row",
    gap: usportSpacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: usportColors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  headerBody: {
    flex: 1,
    gap: usportSpacing.sm,
  },
  nickname: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  handle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "600",
  },
  headerHint: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  highlightGrid: {
    gap: usportSpacing.md,
  },
  highlightCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.sm,
  },
  highlightValue: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  highlightLabel: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  highlightHint: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    lineHeight: 18,
  },
  section: {
    gap: usportSpacing.lg,
  },
  menuGroup: {
    gap: usportSpacing.md,
  },
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.danger,
  },
  logoutText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
  guestContainer: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
    padding: usportSpacing["3xl"],
    justifyContent: "center",
    gap: usportSpacing.lg,
  },
  guestBrand: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  guestTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
    lineHeight: 32,
  },
  guestText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  loginButton: {
    alignSelf: "flex-start",
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing.md,
  },
  loginButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
