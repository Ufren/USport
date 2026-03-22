export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

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

export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email: string;
  phone?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  phone?: string;
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
  venue?: Venue;
  status?: number;
}
