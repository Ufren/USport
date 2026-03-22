import { request, showError, showSuccess } from "../utils/helpers";
import type { ApiResponse } from "../types/api";

export const api = {
  request,

  healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return request.get<{ status: string }>("/health");
  },

  showError,

  showSuccess,
};
