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
  type MessagePreview,
} from "@usport/shared";
import { useNavigation, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../App";
import { useUserStore } from "../store/userStore";
import { SectionHeader } from "../components/common/SectionHeader";
import { invitationApi } from "../services/invitation";

export default function MessagesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [items, setItems] = useState<MessagePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextItems = await invitationApi.messages();
      setItems(nextItems);
    } catch (error: unknown) {
      Alert.alert("加载失败", getErrorMessage(error, "暂时无法获取消息列表"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    void loadMessages();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>消息会在成局后逐步沉淀</Text>
        <Text style={styles.emptyText}>
          先登录，之后你收到的邀约、报名进度和活动群消息都会聚合在这里。
        </Text>
        <Pressable
          style={styles.emptyButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.emptyButtonText}>去登录</Text>
        </Pressable>
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
          onRefresh={() => void loadMessages(true)}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <SectionHeader
        title="消息与进度"
        subtitle="把邀约、报名更新和活动会话收进同一个工作区。"
      />

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={usportColors.brandPrimary} />
          <Text style={styles.loadingText}>正在同步消息...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>还没有新的消息</Text>
          <Text style={styles.messagePreview}>
            别人给你发来邀约、你收到活动状态更新后，消息会汇总到这里。
          </Text>
        </View>
      ) : (
        items.map((message) => (
          <Pressable
            key={message.id}
            style={styles.messageCard}
            onPress={() => navigation.navigate("Invitations")}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageTime}>{message.timestampLabel}</Text>
            </View>
            <Text style={styles.messagePreview}>{message.preview}</Text>
            {message.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{message.unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ))
      )}
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
    gap: usportSpacing.lg,
  },
  loadingCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
  },
  messageCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    borderWidth: 1,
    borderColor: usportColors.border,
    padding: usportSpacing.xl,
    gap: usportSpacing.md,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: usportSpacing.md,
  },
  messageTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.title,
    fontWeight: "700",
    flex: 1,
  },
  messageTime: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
  },
  messagePreview: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    lineHeight: 20,
  },
  unreadBadge: {
    alignSelf: "flex-start",
    backgroundColor: usportColors.brandAccent,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.sm,
    paddingVertical: 2,
  },
  unreadText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.caption,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
    padding: usportSpacing["3xl"],
    justifyContent: "center",
    gap: usportSpacing.lg,
  },
  emptyTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "700",
  },
  emptyText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  emptyButton: {
    alignSelf: "flex-start",
    backgroundColor: usportColors.brandPrimary,
    borderRadius: usportRadius.pill,
    paddingHorizontal: usportSpacing.xl,
    paddingVertical: usportSpacing.md,
  },
  emptyButtonText: {
    color: usportColors.textInverse,
    fontSize: usportTypography.body,
    fontWeight: "700",
  },
});
