import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { userApi } from "../services/user";
import { setToken as setStorageToken } from "../utils/storage";
import { useUserStore } from "../store/userStore";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setToken = useUserStore((state) => state.setToken);

  const handleWechatLogin = async () => {
    setLoading(true);
    try {
      const result = await userApi.wechatLogin("mock-code-for-rn");
      await setStorageToken(result.token);
      setToken(result.token);
      setUserInfo(result.user);
      Alert.alert(
        result.is_new_user ? "注册成功" : "登录成功",
        `欢迎 ${result.user.nickname || "用户"}`,
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("登录失败", error.message || "请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    setLoading(true);
    try {
      const result = await userApi.phoneLogin("mock-phone-code");
      await setStorageToken(result.token);
      setToken(result.token);
      setUserInfo(result.user);
      Alert.alert(
        result.is_new_user ? "注册成功" : "登录成功",
        `欢迎 ${result.user.nickname || "用户"}`,
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("登录失败", error.message || "请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>USport</Text>
      <Text style={styles.slogan}>运动健身，共享场馆</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.wechatButton}
          onPress={handleWechatLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>💬</Text>
              <Text style={styles.wechatButtonText}>微信登录</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.phoneButton}
          onPress={handlePhoneLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1890ff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📱</Text>
              <Text style={styles.phoneButtonText}>手机号登录</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tip}>登录即表示同意</Text>
        <TouchableOpacity>
          <Text style={styles.link}>《用户协议》</Text>
        </TouchableOpacity>
        <Text style={styles.tip}>和</Text>
        <TouchableOpacity>
          <Text style={styles.link}>《隐私政策》</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1890ff",
    marginBottom: 8,
  },
  slogan: {
    fontSize: 14,
    color: "#999",
    marginBottom: 60,
  },
  buttonGroup: {
    width: "100%",
    gap: 15,
  },
  wechatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07c160",
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8,
  },
  wechatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  phoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  phoneButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    fontSize: 18,
  },
  tips: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    gap: 4,
  },
  tip: {
    fontSize: 12,
    color: "#999",
  },
  link: {
    fontSize: 12,
    color: "#1890ff",
  },
});
