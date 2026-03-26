import type {
  CreateReportRequest,
  CreditSummary,
  ReportItem,
} from "@usport/shared";

import { httpClient } from "../utils/http";

export const governanceApi = {
  async creditSummary(): Promise<CreditSummary> {
    return httpClient.get<CreditSummary>("/users/me/credit-summary");
  },

  async reports(): Promise<ReportItem[]> {
    return httpClient.get<ReportItem[]>("/reports");
  },

  async createReport(payload: CreateReportRequest): Promise<ReportItem> {
    return httpClient.post<ReportItem>("/reports", payload);
  },
};
