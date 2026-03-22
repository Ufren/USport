import React, { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  discoverFilters,
  discoverMetrics,
  featuredActivity,
  getUserDisplayName,
  recommendedActivities,
  usportColors,
  usportRadius,
  usportSpacing,
  usportTypography,
  venueSpotlights,
} from "@usport/shared";

import { ActivityListItem } from "../components/discover/ActivityListItem";
import { ActivitySpotlightCard } from "../components/discover/ActivitySpotlightCard";
import { VenueSpotlightCard } from "../components/discover/VenueSpotlightCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { useUserStore } from "../store/userStore";

function filterActivities(filterId: string) {
  if (filterId === "all") {
    return recommendedActivities;
  }

  if (filterId === "weekend") {
    return recommendedActivities.filter((activity) =>
      activity.startTimeLabel.includes("周"),
    );
  }

  return recommendedActivities.filter(
    (activity) => activity.sportCode === filterId,
  );
}

export default function DiscoverScreen() {
  const userInfo = useUserStore((state) => state.userInfo);
  const [activeFilterId, setActiveFilterId] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const visibleActivities = filterActivities(activeFilterId);
  const greeting = userInfo
    ? `${getUserDisplayName(userInfo)}，今晚适合来一局`
    : "今晚在你附近，优先找能成局的运动局";

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={usportColors.brandPrimary}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USport / 同城运动成局</Text>
        <Text style={styles.heroTitle}>{greeting}</Text>
        <Text style={styles.heroSubtitle}>
          把高履约主办方、稳定场馆和合适时段放进一个更容易成局的工作区。
        </Text>

        <View style={styles.metricRow}>
          {discoverMetrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricHint}>{metric.hint}</Text>
            </View>
          ))}
        </View>
      </View>

      <ActivitySpotlightCard activity={featuredActivity} />

      <View style={styles.filterWrap}>
        <SectionHeader
          title="今晚优先"
          subtitle="先筛时间和运动，再看真正能成局的局。"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {discoverFilters.map((filter) => {
              const isActive = filter.id === activeFilterId;

              return (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilterId(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="推荐活动"
          subtitle="保留更高履约率、更清晰门槛和更真实的时间地点信息。"
        />
        <View style={styles.listGroup}>
          {visibleActivities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="推荐场馆"
          subtitle="不是只看距离，更看适不适合你今天要打的这一局。"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.venueRow}>
            {venueSpotlights.map((venue) => (
              <VenueSpotlightCard key={venue.id} venue={venue} />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: usportColors.pageBackground,
  },
  content: {
    paddingBottom: usportSpacing["4xl"],
    gap: usportSpacing.xl,
  },
  hero: {
    paddingHorizontal: usportSpacing.xl,
    paddingTop: usportSpacing["4xl"],
    paddingBottom: usportSpacing["2xl"],
    gap: usportSpacing.lg,
  },
  eyebrow: {
    color: usportColors.brandPrimary,
    fontSize: usportTypography.caption,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.hero,
    fontWeight: "800",
    lineHeight: 38,
  },
  heroSubtitle: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.body,
    lineHeight: 24,
  },
  metricRow: {
    gap: usportSpacing.md,
  },
  metricCard: {
    backgroundColor: usportColors.cardBackground,
    borderRadius: usportRadius.md,
    padding: usportSpacing.xl,
    borderWidth: 1,
    borderColor: usportColors.border,
    gap: usportSpacing.sm,
  },
  metricValue: {
    color: usportColors.textPrimary,
    fontSize: usportTypography.h2,
    fontWeight: "800",
  },
  metricLabel: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  metricHint: {
    color: usportColors.textTertiary,
    fontSize: usportTypography.caption,
    lineHeight: 18,
  },
  filterWrap: {
    gap: usportSpacing.lg,
    paddingHorizontal: usportSpacing.xl,
  },
  filterRow: {
    flexDirection: "row",
    gap: usportSpacing.sm,
    paddingRight: usportSpacing.xl,
  },
  filterChip: {
    paddingHorizontal: usportSpacing.lg,
    paddingVertical: usportSpacing.md,
    borderRadius: usportRadius.pill,
    backgroundColor: usportColors.cardBackground,
    borderWidth: 1,
    borderColor: usportColors.border,
  },
  filterChipActive: {
    backgroundColor: usportColors.brandSecondary,
    borderColor: usportColors.brandSecondary,
  },
  filterChipText: {
    color: usportColors.textSecondary,
    fontSize: usportTypography.bodySm,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: usportColors.textPrimary,
  },
  section: {
    paddingHorizontal: usportSpacing.xl,
    gap: usportSpacing.lg,
  },
  listGroup: {
    gap: usportSpacing.md,
  },
  venueRow: {
    flexDirection: "row",
    gap: usportSpacing.md,
    paddingRight: usportSpacing.xl,
  },
});
