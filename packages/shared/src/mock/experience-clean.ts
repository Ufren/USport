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
  { id: "all", label: "\u5168\u57ce\u80fd\u6210\u5c40" },
  { id: "badminton", label: "\u7fbd\u6bdb\u7403" },
  { id: "running", label: "\u8dd1\u6b65" },
  { id: "basketball", label: "\u7bee\u7403" },
  { id: "weekend", label: "\u5468\u672b\u4f18\u5148" },
];

export const discoverMetrics: ExperienceMetric[] = [
  {
    id: "completion",
    label: "\u672c\u5468\u6210\u5c40\u7387",
    value: "82%",
    hint: "\u4f18\u5148\u5206\u53d1\u9ad8\u610f\u5411\u3001\u9ad8\u5c65\u7ea6\u7684\u6d3b\u52a8\u3002",
  },
  {
    id: "attendance",
    label: "\u5e73\u5747\u5230\u573a\u7387",
    value: "91%",
    hint: "\u4e3b\u529e\u65b9\u548c\u573a\u9986\u90fd\u7ecf\u8fc7\u4f18\u5148\u7b5b\u9009\u3002",
  },
  {
    id: "nearby",
    label: "\u4eca\u665a\u9644\u8fd1\u53ef\u7ea6",
    value: "16 \u573a",
    hint: "\u57fa\u4e8e\u57ce\u5e02\u3001\u65f6\u95f4\u548c\u504f\u597d\u5b9e\u65f6\u63a8\u8350\u3002",
  },
];

export const featuredActivity: ExperienceActivity = {
  id: 1001,
  title: "\u4eca\u665a 8 \u4eba\u7fbd\u6bdb\u7403\u53cb\u597d\u5c40",
  subtitle:
    "\u4e2d\u7ea7\u53cb\u597d\uff0c\u5730\u94c1\u53e3 300 \u7c73\uff0c\u5b98\u65b9\u6258\u5e95\u6210\u5c40",
  sportCode: "badminton",
  sportLabel: "\u7fbd\u6bdb\u7403",
  district: "\u4e0a\u6d77\u00b7\u6d66\u4e1c\u65b0\u533a",
  venueName: "\u6e90\u6df1\u4f53\u80b2\u9986 3 \u53f7\u573a",
  startTimeLabel: "\u4eca\u5929 19:30 - 21:30",
  feeLabel: "AA \u7ea6 48 \u5143",
  participantSummary: "\u5df2\u786e\u8ba4 6 / 8 \u4eba",
  attendanceLabel: "\u4e3b\u529e\u65b9\u8fd1 30 \u5929\u5230\u573a\u7387 96%",
  hostName: "Jasper",
  hostBadge: "\u5b9e\u540d\u8ba4\u8bc1\u4e3b\u529e\u65b9",
  status: "published",
  tags: [
    "\u4eca\u665a\u4f18\u5148",
    "\u5b98\u65b9\u6258\u5e95",
    "\u65b0\u624b\u53cb\u597d",
  ],
  actionLabel: "\u7acb\u5373\u62a5\u540d",
};

export const recommendedActivities: ExperienceActivity[] = [
  featuredActivity,
  {
    id: 1002,
    title:
      "\u5468\u516d\u6e05\u6668\u6ee8\u6c5f 8 \u516c\u91cc\u914d\u901f\u8dd1",
    subtitle:
      "\u8f7b\u793e\u4ea4 + \u7a33\u5b9a\u914d\u901f\uff0c\u8dd1\u540e\u4e00\u8d77\u65e9\u9910",
    sportCode: "running",
    sportLabel: "\u8dd1\u6b65",
    district: "\u4e0a\u6d77\u00b7\u5f90\u6c47\u533a",
    venueName: "\u9f99\u7f8e\u672f\u9986\u96c6\u5408\u70b9",
    startTimeLabel: "\u5468\u516d 07:15 - 08:30",
    feeLabel: "\u514d\u8d39",
    participantSummary: "\u5df2\u786e\u8ba4 12 / 18 \u4eba",
    attendanceLabel: "\u6700\u8fd1\u4e09\u5468\u590d\u7ea6\u7387 64%",
    hostName: "Mia",
    hostBadge: "\u9ad8\u590d\u7ea6\u9886\u8dd1",
    status: "published",
    tags: [
      "\u6e05\u6668\u5c40",
      "\u590d\u7ea6\u9ad8",
      "\u5973\u751f\u53cb\u597d",
    ],
    actionLabel: "\u52a0\u5165\u8dd1\u56e2",
  },
  {
    id: 1003,
    title: "\u5468\u4e94\u4e0b\u73ed\u7bee\u7403\u534a\u573a\u5feb\u5c40",
    subtitle:
      "90 \u5206\u949f\u5feb\u8282\u594f\uff0c\u9002\u5408\u4e0b\u73ed\u76f4\u63a5\u8fc7\u6765",
    sportCode: "basketball",
    sportLabel: "\u7bee\u7403",
    district: "\u4e0a\u6d77\u00b7\u957f\u5b81\u533a",
    venueName: "\u5929\u5c71\u8def\u793e\u533a\u7403\u573a",
    startTimeLabel: "\u5468\u4e94 20:00 - 21:30",
    feeLabel: "\u514d\u8d39",
    participantSummary: "\u5df2\u786e\u8ba4 9 / 10 \u4eba",
    attendanceLabel: "\u6700\u8fd1 10 \u573a\u5e73\u5747\u5230\u573a\u7387 89%",
    hostName: "Leo",
    hostBadge: "\u6d3b\u8dc3\u4e3b\u529e\u65b9",
    status: "full",
    tags: ["\u6ee1\u5458\u5019\u8865", "\u4e0b\u73ed\u5c40"],
    actionLabel: "\u52a0\u5165\u5019\u8865",
  },
];

export const venueSpotlights: VenueSpotlight[] = [
  {
    id: 2001,
    name: "\u524d\u6ee9\u8fd0\u52a8\u516c\u56ed",
    district: "\u6d66\u4e1c\u65b0\u533a",
    commuteLabel: "\u5730\u94c1 6 \u53f7\u7ebf\u6b65\u884c 5 \u5206\u949f",
    vibe: "\u591c\u573a\u706f\u5149\u7a33\u5b9a\uff0c\u9002\u5408\u4e0b\u73ed\u540e\u5feb\u901f\u6210\u5c40\u3002",
    surfaceLabel: "\u7efc\u5408\u7403\u573a",
    features: [
      "\u591c\u573a\u5f00\u653e",
      "\u505c\u8f66\u65b9\u4fbf",
      "\u66f4\u8863\u6dcb\u6d74",
    ],
  },
  {
    id: 2002,
    name: "\u897f\u5cb8\u8dd1\u6b65\u9a7f\u7ad9",
    district: "\u5f90\u6c47\u533a",
    commuteLabel:
      "\u6c5f\u8fb9\u76f4\u8fbe\uff0c\u8dd1\u540e\u8865\u7ed9\u65b9\u4fbf",
    vibe: "\u9002\u5408\u6668\u8dd1\u4e0e\u793e\u7fa4\u590d\u7ea6\uff0c\u793e\u4ea4\u6c1b\u56f4\u8f7b\u677e\u3002",
    surfaceLabel: "\u8dd1\u6b65\u805a\u70b9",
    features: [
      "\u50a8\u7269\u67dc",
      "\u5496\u5561\u8865\u7ed9",
      "\u62c9\u4f38\u533a",
    ],
  },
];

export const loginValuePoints: LoginValuePoint[] = [
  {
    id: "match",
    title: "\u5148\u627e\u80fd\u6210\u5c40\u7684\u4eba",
    description:
      "\u4f18\u5148\u63a8\u8350\u4eca\u665a\u548c\u5468\u672b\u771f\u6b63\u6709\u5c65\u7ea6\u6982\u7387\u7684\u8fd0\u52a8\u5c40\u3002",
  },
  {
    id: "venue",
    title: "\u573a\u9986\u548c\u642d\u5b50\u4e00\u8d77\u8003\u8651",
    description:
      "\u4e0d\u662f\u6cdb\u793e\u4ea4\uff0c\u800c\u662f\u56f4\u7ed5\u771f\u5b9e\u8fd0\u52a8\u573a\u666f\u5feb\u901f\u6210\u5c40\u3002",
  },
  {
    id: "credit",
    title: "\u5c65\u7ea6\u548c\u4fe1\u7528\u53ef\u89c1",
    description:
      "\u9ad8\u5230\u573a\u7387\u3001\u9ad8\u590d\u7ea6\u7387\u7684\u4eba\u4f1a\u88ab\u6301\u7eed\u4f18\u5148\u5c55\u793a\u3002",
  },
];

export const messagePreviews: MessagePreview[] = [
  {
    id: 3001,
    title: "\u4eca\u665a\u7fbd\u6bdb\u7403\u53cb\u597d\u5c40",
    preview:
      "\u4e3b\u529e\u65b9\uff1a\u5df2\u7ecf\u5e2e\u4f60\u9884\u7559\u4e86 3 \u53f7\u573a\u8fb9\u7ebf\u4f4d\u7f6e\u3002",
    timestampLabel: "18:24",
    unreadCount: 2,
  },
  {
    id: 3002,
    title: "Mia \u7684\u5468\u516d\u6668\u8dd1\u7fa4",
    preview:
      "\u672c\u5468\u914d\u901f 6'10\uff0c\u8dd1\u540e\u4e00\u8d77\u5403\u65e9\u9910\u3002",
    timestampLabel: "\u6628\u5929",
    unreadCount: 0,
  },
];

export const profileHighlights: ProfileHighlight[] = [
  {
    id: "completion",
    label: "\u8d44\u6599\u5b8c\u6574\u5ea6",
    value: "86%",
    hint: "\u8865\u5168\u4e3b\u8fd0\u52a8\u548c\u5e38\u6d3b\u52a8\u65f6\u6bb5\u80fd\u63d0\u5347\u5339\u914d\u6548\u7387\u3002",
  },
  {
    id: "credit",
    label: "\u4fe1\u7528\u5206",
    value: "98",
    hint: "\u7a33\u5b9a\u5c65\u7ea6\u548c\u4f4e\u53d6\u6d88\u7387\u4f1a\u6301\u7eed\u63d0\u9ad8\u66dd\u5149\u3002",
  },
  {
    id: "attendance",
    label: "\u8fd1 30 \u5929\u5230\u573a",
    value: "7 \u6b21",
    hint: "\u8fd1 30 \u5929\u4f60\u5df2\u7ecf\u5b8c\u6210\u4e86 7 \u6b21\u771f\u5b9e\u5230\u573a\u3002",
  },
];

export const profileMenuItems: ProfileMenuItem[] = [
  {
    id: "activities",
    title: "\u6211\u7684\u6d3b\u52a8",
    description:
      "\u67e5\u770b\u5df2\u62a5\u540d\u3001\u5f85\u51fa\u53d1\u3001\u5df2\u5b8c\u6210\u7684\u8fd0\u52a8\u5c40\u3002",
  },
  {
    id: "invitations",
    title: "\u6211\u7684\u9080\u7ea6",
    description:
      "\u96c6\u4e2d\u5904\u7406\u6536\u5230\u7684\u9080\u7ea6\u548c\u4f60\u53d1\u8d77\u7684\u642d\u5b50\u8bf7\u6c42\u3002",
  },
  {
    id: "credit",
    title: "\u4fe1\u7528\u4e0e\u5c65\u7ea6",
    description:
      "\u67e5\u770b\u53d6\u6d88\u3001\u5230\u573a\u548c\u590d\u7ea6\u8bb0\u5f55\u3002",
    badge: "\u91cd\u8981",
  },
  {
    id: "membership",
    title: "\u4f1a\u5458\u6743\u76ca",
    description:
      "\u89e3\u9501\u66f4\u9ad8\u66dd\u5149\u3001\u4f18\u5148\u63a8\u8350\u548c\u9ad8\u7ea7\u7b5b\u9009\u3002",
  },
];
