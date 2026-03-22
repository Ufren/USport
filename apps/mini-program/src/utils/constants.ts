export const API_BASE_URL = "http://localhost:8080/api/v1";

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_INFO: "user_info",
  SETTINGS: "settings",
} as const;

export const REQUEST_TIMEOUT = 10000;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
