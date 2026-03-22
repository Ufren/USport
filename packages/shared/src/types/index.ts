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
