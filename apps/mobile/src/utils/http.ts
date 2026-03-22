import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  STORAGE_KEYS,
} from "../utils/constants";

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

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
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;
        if (data.code !== 0) {
          return Promise.reject(new Error(data.message || "Request failed"));
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.log("Unauthorized, redirect to login");
        }
        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    return null;
  }

  async get<T>(
    url: string,
    params?: any,
    config?: { params?: Record<string, string> },
  ): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, {
      params,
      ...config,
    });
    return response.data.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: { params?: Record<string, string> },
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, { params });
    return response.data.data;
  }
}

export const httpClient = new HttpClient();
