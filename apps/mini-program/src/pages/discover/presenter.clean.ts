import type {
  ExperienceActivity,
  ExperienceFilter,
  ExperienceMetric,
  VenueSpotlight,
} from "@usport/shared";
import {
  discoverFilters,
  discoverMetrics,
  featuredActivity,
  recommendedActivities,
  venueSpotlights,
} from "@usport/shared";

export interface DiscoverPageState {
  cityName: string;
  activeFilterId: string;
  filters: ExperienceFilter[];
  metrics: ExperienceMetric[];
  featuredActivity: ExperienceActivity;
  activities: ExperienceActivity[];
  venues: VenueSpotlight[];
}

function filterActivities(activeFilterId: string): ExperienceActivity[] {
  if (activeFilterId === "all") {
    return recommendedActivities;
  }

  if (activeFilterId === "weekend") {
    return recommendedActivities.filter((activity) =>
      activity.startTimeLabel.includes("周"),
    );
  }

  return recommendedActivities.filter(
    (activity) => activity.sportCode === activeFilterId,
  );
}

export function buildDiscoverPageState(
  activeFilterId: string = "all",
): DiscoverPageState {
  return {
    cityName: "上海",
    activeFilterId,
    filters: discoverFilters,
    metrics: discoverMetrics,
    featuredActivity,
    activities: filterActivities(activeFilterId),
    venues: venueSpotlights,
  };
}
