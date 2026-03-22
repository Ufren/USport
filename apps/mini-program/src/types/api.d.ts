import type {
  ApiResponse,
  LoginResult,
  QueryParams,
  UserInfo,
} from "@usport/shared";

export type { ApiResponse, LoginResult, UserInfo };

export interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  query?: QueryParams;
  header?: Record<string, string>;
}
