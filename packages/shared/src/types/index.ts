export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserProfile {
  id: number;
  nickname?: string;
  avatar?: string;
  openid?: string;
  unionid?: string;
  phone?: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export type UserInfo = UserProfile;

export interface LoginResult {
  token: string;
  user: UserProfile;
  is_new_user: boolean;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  image?: string;
  description?: string;
  status?: number;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  time: string;
  cover?: string;
  venue?: Venue;
  status?: number;
}

export type ActivityStatus =
  | "published"
  | "full"
  | "signup_closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface ExperienceFilter {
  id: string;
  label: string;
}

export interface ExperienceMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface ExperienceActivity {
  id: number;
  title: string;
  subtitle: string;
  sportCode: string;
  sportLabel: string;
  district: string;
  venueName: string;
  startTimeLabel: string;
  feeLabel: string;
  participantSummary: string;
  attendanceLabel: string;
  hostName: string;
  hostBadge: string;
  status: ActivityStatus;
  tags: string[];
  actionLabel: string;
}

export type ActivitySignupStatus = "none" | "registered" | "waitlisted";

export interface ActivityStatusTone {
  label: string;
  tone: "success" | "warning" | "neutral" | "danger";
}

export interface ExperienceActivityHost {
  name: string;
  badge: string;
  attendanceLabel: string;
  recentSessionsLabel: string;
}

export interface ExperienceActivityDetail {
  id: string;
  sourceActivityId?: number;
  title: string;
  sportCode: string;
  sportLabel: string;
  status: ActivityStatus;
  statusTone: ActivityStatusTone;
  riskHint?: string;
  coverLabel: string;
  subtitle: string;
  startTimeLabel: string;
  endTimeLabel: string;
  signupDeadlineLabel: string;
  district: string;
  venueName: string;
  addressHint: string;
  participantSummary: string;
  feeLabel: string;
  host: ExperienceActivityHost;
  description: string;
  suitableCrowd: string[];
  skillLevelLabel: string;
  genderRuleLabel: string;
  notices: string[];
  allowWaitlist: boolean;
  shareSummary: string;
}

export interface VenueSpotlight {
  id: number;
  name: string;
  district: string;
  commuteLabel: string;
  vibe: string;
  surfaceLabel: string;
  features: string[];
}

export interface LoginValuePoint {
  id: string;
  title: string;
  description: string;
}

export interface MessagePreview {
  id: number;
  title: string;
  preview: string;
  timestampLabel: string;
  unreadCount: number;
}

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface InvitationItem {
  id: number;
  activityId: number;
  activityTitle: string;
  activityTime: string;
  venueLabel: string;
  senderName: string;
  senderBadge: string;
  message: string;
  status: InvitationStatus;
  statusLabel: string;
  createdAtLabel: string;
  canAccept: boolean;
  canDecline: boolean;
  participantHint: string;
}

export interface ProfileHighlight {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface ProfileMenuItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

export interface CreateActivityOption {
  value: string;
  label: string;
  description: string;
}

export interface CreateActivityFormDraft {
  sportCode: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  deadlineTime: string;
  district: string;
  venueName: string;
  capacity: number;
  waitlistCapacity: number;
  feeType: "free" | "aa" | "fixed_price";
  feeAmount: string;
  joinRule: "direct" | "approval_required";
  visibility: "public" | "invite_only";
}

export type MyActivityRole = "host" | "participant";

export interface MyActivityItem extends ExperienceActivity {
  role: MyActivityRole;
  registrationStatus?: "registered" | "waitlisted";
  canCancel: boolean;
  canManage: boolean;
}
