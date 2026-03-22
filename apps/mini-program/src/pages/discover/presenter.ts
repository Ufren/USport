import type {
  ExperienceActivity,
  ExperienceFilter,
  ExperienceMetric,
  VenueSpotlight,
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

const filters: ExperienceFilter[] = [
  { id: "all", label: "全城能成局" },
  { id: "badminton", label: "羽毛球" },
  { id: "running", label: "跑步" },
  { id: "basketball", label: "篮球" },
  { id: "weekend", label: "周末局" },
];

const metrics: ExperienceMetric[] = [
  {
    id: "completion",
    label: "本周成局率",
    value: "82%",
    hint: "优先推荐高履约局",
  },
  {
    id: "attendance",
    label: "平均到场率",
    value: "91%",
    hint: "主办方与场馆双筛选",
  },
  {
    id: "nearby",
    label: "今晚附近可约",
    value: "16 场",
    hint: "下班后优先推荐",
  },
];

const featuredActivity: ExperienceActivity = {
  id: 1001,
  title: "今晚 8 人羽毛球友好局",
  subtitle: "中级友好，地铁口 300 米，官方托底成局",
  sportCode: "badminton",
  sportLabel: "羽毛球",
  district: "上海 · 浦东新区",
  venueName: "源深体育馆 3 号场",
  startTimeLabel: "今天 19:30 - 21:30",
  feeLabel: "AA 约 48 元",
  participantSummary: "已确认 6 / 8 人",
  attendanceLabel: "主办方近 30 天到场率 96%",
  hostName: "Jasper",
  hostBadge: "实名主办方",
  status: "published",
  tags: ["今晚优先", "官方托底", "新手友好"],
  actionLabel: "立即报名",
};

const allActivities: ExperienceActivity[] = [
  featuredActivity,
  {
    id: 1002,
    title: "周六清晨滨江 8 公里配速跑",
    subtitle: "轻社交 + 配速稳定，跑后一起早餐",
    sportCode: "running",
    sportLabel: "跑步",
    district: "上海 · 徐汇滨江",
    venueName: "龙美术馆集合点",
    startTimeLabel: "周六 07:15 - 08:30",
    feeLabel: "免费",
    participantSummary: "已确认 12 / 18 人",
    attendanceLabel: "最近三周复约率 64%",
    hostName: "Mia",
    hostBadge: "高履约领跑",
    status: "published",
    tags: ["清晨局", "复约高", "女生友好"],
    actionLabel: "加入跑团",
  },
  {
    id: 1003,
    title: "周五下班篮球半场快局",
    subtitle: "90 分钟快节奏，适合下班直接过来",
    sportCode: "basketball",
    sportLabel: "篮球",
    district: "上海 · 长宁区",
    venueName: "天山路社区球场",
    startTimeLabel: "周五 20:00 - 21:30",
    feeLabel: "免费",
    participantSummary: "已确认 9 / 10 人",
    attendanceLabel: "最近 10 场平均到场率 89%",
    hostName: "Leo",
    hostBadge: "活跃主办方",
    status: "full",
    tags: ["满员候补", "下班局"],
    actionLabel: "加入候补",
  },
];

const venues: VenueSpotlight[] = [
  {
    id: 2001,
    name: "前滩运动公园",
    district: "浦东新区",
    commuteLabel: "地铁 6 号线步行 5 分钟",
    vibe: "夜场灯光稳定，适合下班后快速成局。",
    surfaceLabel: "综合球场",
    features: ["夜场开放", "停车方便", "更衣淋浴"],
  },
  {
    id: 2002,
    name: "西岸跑步驿站",
    district: "徐汇区",
    commuteLabel: "江边直达，跑后补给方便",
    vibe: "适合晨跑与社群复约，社交氛围舒服。",
    surfaceLabel: "跑步聚点",
    features: ["储物柜", "咖啡补给", "拉伸区"],
  },
];

function filterActivities(activeFilterId: string): ExperienceActivity[] {
  if (activeFilterId === "all") {
    return allActivities;
  }

  if (activeFilterId === "weekend") {
    return allActivities.filter((activity) =>
      activity.startTimeLabel.includes("周"),
    );
  }

  return allActivities.filter(
    (activity) => activity.sportCode === activeFilterId,
  );
}

export function buildDiscoverPageState(
  activeFilterId: string = "all",
): DiscoverPageState {
  return {
    cityName: "上海",
    activeFilterId,
    filters,
    metrics,
    featuredActivity,
    activities: filterActivities(activeFilterId),
    venues,
  };
}
