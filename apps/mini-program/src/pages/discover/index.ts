import type { ExperienceActivity } from "@usport/shared";

import { activityApi } from "../../services/activity";
import { buildDiscoverPageState } from "./presenter.clean";

function filterActivities(
  activities: ExperienceActivity[],
  activeFilterId: string,
): ExperienceActivity[] {
  if (activeFilterId === "all") {
    return activities;
  }

  if (activeFilterId === "weekend") {
    return activities.filter((activity) =>
      activity.startTimeLabel.includes("周"),
    );
  }

  return activities.filter((activity) => activity.sportCode === activeFilterId);
}

Page({
  data: {
    allActivities: [] as ExperienceActivity[],
    ...buildDiscoverPageState(),
  },

  onLoad() {
    void this.refreshPage();
  },

  onPullDownRefresh() {
    void this.refreshPage(true);
  },

  async refreshPage(stopPullDown: boolean = false) {
    const activeFilterId = String(this.data.activeFilterId ?? "all");
    const fallbackState = buildDiscoverPageState(activeFilterId);

    try {
      const allActivities = await activityApi.list();
      const filteredActivities = filterActivities(
        allActivities,
        activeFilterId,
      );

      this.setData({
        ...fallbackState,
        allActivities,
        featuredActivity: allActivities[0] ?? fallbackState.featuredActivity,
        activities:
          filteredActivities.length > 0 ? filteredActivities : allActivities,
      });
    } catch {
      this.setData({
        allActivities: fallbackState.activities,
        ...fallbackState,
      });
    } finally {
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  onFilterTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { filterId?: string }
    >,
  ) {
    const filterId = String(e.currentTarget.dataset.filterId ?? "all");
    const baseState = buildDiscoverPageState(filterId);
    const sourceActivities =
      (this.data.allActivities as ExperienceActivity[]) || [];
    const filteredActivities = filterActivities(sourceActivities, filterId);

    this.setData({
      ...baseState,
      allActivities: sourceActivities,
      featuredActivity: sourceActivities[0] ?? baseState.featuredActivity,
      activities:
        filteredActivities.length > 0
          ? filteredActivities
          : baseState.activities,
    });
  },

  onActivityTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number }
    >,
  ) {
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${String(
        e.currentTarget.dataset.id ?? "1001",
      )}`,
    });
  },

  onVenueTap(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { name?: string }>,
  ) {
    wx.showToast({
      title: `${e.currentTarget.dataset.name ?? "场馆"}详情开发中`,
      icon: "none",
    });
  },

  onCreateTap() {
    wx.navigateTo({ url: "/pages/create-activity/index" });
  },
});
