import type {
  ExperienceActivity,
  ExperienceFilter,
  ExperienceMetric,
  LoginValuePoint,
  MessagePreview,
  ProfileHighlight,
  ProfileMenuItem,
  VenueSpotlight,
} from "../types";

export const discoverFilters: ExperienceFilter[] = [
  { id: "all", label: "全城能成局" },
  { id: "badminton", label: "羽毛球" },
  { id: "running", label: "跑步" },
  { id: "basketball", label: "篮球" },
  { id: "weekend", label: "周末优先" },
];

export const discoverMetrics: ExperienceMetric[] = [
  {
    id: "completion",
    label: "本周成局率",
    value: "82%",
    hint: "官方托底与高意向人群优先分发",
  },
  {
    id: "attendance",
    label: "平均到场率",
    value: "91%",
    hint: "优先展示高履约主办方和稳定场馆",
  },
  {
    id: "nearby",
    label: "今晚附近可约",
    value: "16 场",
    hint: "基于城市、时段和运动偏好实时推荐",
  },
];

export const featuredActivity: ExperienceActivity = {
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

export const recommendedActivities: ExperienceActivity[] = [
  featuredActivity,
  {
    id: 1002,
    title: "周六清晨滨江 8 公里配速跑",
    subtitle: "轻社交 + 配速稳定，结束一起早餐",
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

export const venueSpotlights: VenueSpotlight[] = [
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

export const loginValuePoints: LoginValuePoint[] = [
  {
    id: "match",
    title: "先找能成局的人",
    description: "优先推荐今晚和周末真正有履约概率的运动局。",
  },
  {
    id: "venue",
    title: "场馆和搭子一起考虑",
    description: "不是单纯社交，而是围绕真实运动场景快速成局。",
  },
  {
    id: "credit",
    title: "履约和信用可见",
    description: "高到场率、高复约率、高信用的人会被持续优先展示。",
  },
];

export const messagePreviews: MessagePreview[] = [
  {
    id: 3001,
    title: "今晚羽毛球友好局",
    preview: "主办方：已经帮你预留了 3 号场边线位置。",
    timestampLabel: "18:24",
    unreadCount: 2,
  },
  {
    id: 3002,
    title: "Mia 的周六晨跑搭子群",
    preview: "本周配速 6'10，跑后一起吃早饭。",
    timestampLabel: "昨天",
    unreadCount: 0,
  },
];

export const profileHighlights: ProfileHighlight[] = [
  {
    id: "completion",
    label: "资料完整度",
    value: "86%",
    hint: "补全主运动和常活动时段能提升匹配效率",
  },
  {
    id: "credit",
    label: "信用分",
    value: "98",
    hint: "稳定履约和低取消率会持续提高曝光",
  },
  {
    id: "attendance",
    label: "近 30 天到场",
    value: "7 次",
    hint: "最近 30 天你已经完成了 7 次真实到场",
  },
];

export const profileMenuItems: ProfileMenuItem[] = [
  {
    id: "activities",
    title: "我的活动",
    description: "查看已报名、待出发、已完成的运动局。",
  },
  {
    id: "invitations",
    title: "我的邀约",
    description: "集中处理收到的邀约和你发起的搭子请求。",
  },
  {
    id: "credit",
    title: "信用与履约",
    description: "查看爽约、到场和复约记录。",
    badge: "重要",
  },
  {
    id: "membership",
    title: "会员权益",
    description: "解锁更高曝光、优先推荐和高级筛选。",
  },
];
