import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import type { ApiResponse, QueryParams } from "@usport/shared";

import { API_BASE_URL, REQUEST_TIMEOUT } from "../utils/constants";
import { getToken } from "./storage";

type RequestConfig = {
  params?: QueryParams;
};

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { data } = response;
        if (data.code !== 0) {
          return Promise.reject(new Error(data.message || "Request failed"));
        }
        return response;
      },
      (error: AxiosError) => Promise.reject(error),
    );
  }

  async get<T>(
    url: string,
    params?: QueryParams,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, {
      params,
      ...config,
    });
    return response.data.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string, params?: QueryParams): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, { params });
    return response.data.data;
  }
}

export const httpClient = new HttpClient();
