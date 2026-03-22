import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import { getUserDisplayName, getUserHandle } from "@usport/shared";

import { useUserStore } from "../store/userStore";
import { removeToken } from "../utils/storage";

export default function UserScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const userInfo = useUserStore((state) => state.userInfo);
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert("提示", "确定要退出登录吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          logout();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const menuItems = [
    { label: "我的订单", onPress: () => {} },
    { label: "我的场馆", onPress: () => {} },
    { label: "我的活动", onPress: () => {} },
    { label: "设置", onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getUserDisplayName(userInfo, "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{getUserDisplayName(userInfo)}</Text>
          <Text style={styles.username}>{getUserHandle(userInfo)}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.menuArrow}>{">"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1890ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  nickname: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  menu: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  menuArrow: {
    fontSize: 16,
    color: "#ccc",
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#ff4d4f",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
