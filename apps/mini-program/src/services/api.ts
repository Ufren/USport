import { request, showError, showSuccess } from "../utils/helpers";
import type { ApiResponse } from "../types/api";

interface ApiService {
  healthCheck: () => Promise<ApiResponse<{ status: string }>>;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

export const api: ApiService = {
  healthCheck() {
    return request.get<{ status: string }>("/health");
  },
  showError,
  showSuccess,
};
