import type { CreditSummary, ReportItem } from "@usport/shared";

import { governanceApi } from "../../services/governance";
import { showError, showSuccess } from "../../utils/helpers";

const reasonOptions = [
  { value: "host_no_show", label: "主办方失约" },
  { value: "spam_invite", label: "骚扰邀约" },
  { value: "unsafe_behavior", label: "不安全行为" },
] as const;

Page({
  data: {
    loading: true,
    summary: null as CreditSummary | null,
    reports: [] as ReportItem[],
    reasonOptions,
    selectedReason: "host_no_show",
    description: "",
  },

  onLoad() {
    void this.loadPage();
  },

  onPullDownRefresh() {
    void this.loadPage(true);
  },

  async loadPage(stopPullDown = false) {
    this.setData({ loading: true });
    try {
      const [summary, reports] = await Promise.all([
        governanceApi.creditSummary(),
        governanceApi.reports(),
      ]);
      this.setData({ summary, reports });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "获取信用信息失败");
    } finally {
      this.setData({ loading: false });
      if (stopPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  onReasonTap(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { value?: string }>,
  ) {
    this.setData({
      selectedReason: String(e.currentTarget.dataset.value ?? "host_no_show"),
    });
  },

  onDescriptionInput(e: WechatMiniprogram.CustomEvent<{ value?: string }>) {
    this.setData({
      description: String(e.detail.value ?? ""),
    });
  },

  async onSubmitReport() {
    try {
      await governanceApi.createReport({
        targetType: "activity",
        targetId: 1001,
        reasonCode: this.data.selectedReason,
        description: this.data.description,
      });
      showSuccess("举报已提交");
      this.setData({ description: "" });
      await this.loadPage();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "举报提交失败");
    }
  },
});
