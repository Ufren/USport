import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
} from "@usport/shared";

import ActivityDetailScreen from "./src/screens/ActivityDetailScreen";
import CreateActivityScreen from "./src/screens/CreateActivityScreen";
import InvitationInboxScreen from "./src/screens/InvitationInboxScreenClean";
import MyActivitiesScreen from "./src/screens/MyActivitiesScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import DiscoverScreen from "./src/screens/DiscoverScreen";
import LoginEntryScreen from "./src/screens/LoginEntryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { useBootstrapSession } from "./src/hooks/useBootstrapSession";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  ActivityDetail: { id: string };
  CreateActivity: undefined;
  MyActivities: undefined;
  Invitations: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  User: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const indicatorStyle: ViewStyle = focused
    ? styles.tabIndicatorActive
    : styles.tabIndicator;

  return (
    <View style={styles.tabLabelWrap}>
      <View style={indicatorStyle} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel label="发现" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel label="消息" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel label="我的" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function BootScreen() {
  return (
    <View style={styles.bootContainer}>
      <Text style={styles.bootBrand}>USport</Text>
      <Text style={styles.bootText}>正在恢复你的运动局工作区...</Text>
      <ActivityIndicator color={usportColors.brandPrimary} />
    </View>
  );
}

function AppNavigator() {
  const bootstrapped = useBootstrapSession();

  if (!bootstrapped) {
    return <BootScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginEntryScreen} />
        <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
        <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
        <Stack.Screen name="MyActivities" component={MyActivitiesScreen} />
        <Stack.Screen name="Invitations" component={InvitationInboxScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: usportSpacing.sm,
    paddingBottom: usportSpacing.lg,
    backgroundColor: usportColors.cardBackground,
    borderTopColor: usportColors.border,
  },
  tabLabelWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: usportSpacing.sm,
    minWidth: 72,
  },
  tabIndicator: {
    width: 18,
    height: 4,
    borderRadius: usportRadius.pill,
    backgroundColor: "transparent",
  },
  tabIndicatorActive: {
    width: 18,
    height: 4,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.brandPrimary,
  },
  tabLabel: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: usportColors.textPrimary,
  },
  bootContainer: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
    alignItems: "center",
    justifyContent: "center",
    gap: usportSpacing.lg,
    padding: usportSpacing["3xl"],
  },
  bootBrand: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.hero,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  bootText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
  },
});

export default App;
