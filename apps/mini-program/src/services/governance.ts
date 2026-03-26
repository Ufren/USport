import type {
  ApiResponse,
  CreateReportRequest,
  CreditSummary,
  ReportItem,
} from "@usport/shared";

import { request } from "../utils/helpers";

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 0) {
    throw new Error(response.message || "请求失败");
  }

  return response.data;
}

export const governanceApi = {
  async creditSummary(): Promise<CreditSummary> {
    return unwrapResponse(
      await request.get<CreditSummary>("/users/me/credit-summary"),
    );
  },

  async reports(): Promise<ReportItem[]> {
    return unwrapResponse(await request.get<ReportItem[]>("/reports"));
  },

  async createReport(payload: CreateReportRequest): Promise<ReportItem> {
    return unwrapResponse(await request.post<ReportItem>("/reports", payload));
  },
};
