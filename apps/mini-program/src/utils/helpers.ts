import type { QueryParams } from "@usport/shared";

import { API_BASE_URL, REQUEST_TIMEOUT } from "./constants";
import type { ApiResponse, RequestOptions } from "../types/api";

class Request {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getAuthHeader(): Record<string, string> {
    const token = wx.getStorageSync("token");
    const header: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    return header;
  }

  private buildUrl(url: string, query?: QueryParams): string {
    if (!query) {
      return url;
    }

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      wx.showLoading({ title: "加载中..." });

      const fullUrl = this.buildUrl(options.url, options.query);

      wx.request<ApiResponse<T>>({
        url: `${this.baseURL}${fullUrl}`,
        method: options.method || "GET",
        data: options.data as
          | string
          | WechatMiniprogram.IAnyObject
          | ArrayBuffer
          | undefined,
        header: {
          ...this.getAuthHeader(),
          ...options.header,
        },
        timeout: this.timeout,
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as ApiResponse<T>);
            return;
          }

          if (res.statusCode === 401) {
            wx.navigateTo({ url: "/pages/auth/index" });
            reject(new Error("Unauthorized"));
            return;
          }

          reject(new Error(res.data?.message || "Request failed"));
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({
            title: "网络请求失败",
            icon: "none",
          });
          reject(err);
        },
      });
    });
  }

  get<T>(
    url: string,
    data?: unknown,
    query?: QueryParams,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: "GET", data, query });
  }

  post<T>(
    url: string,
    data?: unknown,
    query?: QueryParams,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: "POST", data, query });
  }

  put<T>(
    url: string,
    data?: unknown,
    query?: QueryParams,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: "PUT", data, query });
  }

  delete<T>(
    url: string,
    data?: unknown,
    query?: QueryParams,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: "DELETE", data, query });
  }
}

export const request = new Request(API_BASE_URL, REQUEST_TIMEOUT);

export function showError(message: string): void {
  wx.showToast({
    title: message,
    icon: "none",
    duration: 2000,
  });
}

export function showSuccess(message: string): void {
  wx.showToast({
    title: message,
    icon: "success",
    duration: 1500,
  });
}

export function formatTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number,
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (...args: TArgs) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
