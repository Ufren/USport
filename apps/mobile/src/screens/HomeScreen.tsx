import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useUserStore } from "../store/userStore";

interface Activity {
  id: number;
  title: string;
  time: string;
  cover: string;
}

interface Venue {
  id: number;
  name: string;
  address: string;
  image: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setActivities([
      { id: 1, title: "周末篮球赛", time: "2024-01-20 14:00", cover: "" },
      { id: 2, title: "游泳公开课", time: "2024-01-21 10:00", cover: "" },
    ]);
    setVenues([
      { id: 1, name: "篮球馆A", address: "朝阳区建国路88号", image: "" },
      { id: 2, name: "游泳馆B", address: "海淀区中关村大街100号", image: "" },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          你好, {userInfo?.nickname || userInfo?.username || "游客"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>热门活动</Text>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>推荐场馆</Text>
        <View style={styles.venueGrid}>
          {venues.map((venue) => (
            <View key={venue.id} style={styles.venueCard}>
              <View style={styles.venueImage} />
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueAddress}>{venue.address}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  activityTime: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  venueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  venueCard: {
    width: "50%",
    padding: 5,
  },
  venueImage: {
    height: 100,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  venueName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
  },
  venueAddress: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
