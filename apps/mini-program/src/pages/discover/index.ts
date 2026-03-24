import { buildDiscoverPageState } from "./presenter.clean";

Page({
  data: buildDiscoverPageState(),

  onLoad() {
    this.refreshPage();
  },

  onPullDownRefresh() {
    this.refreshPage();
    wx.stopPullDownRefresh();
  },

  refreshPage() {
    this.setData(
      buildDiscoverPageState(String(this.data.activeFilterId ?? "all")),
    );
  },

  onFilterTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { filterId?: string }
    >,
  ) {
    const filterId = String(e.currentTarget.dataset.filterId ?? "all");
    this.setData(buildDiscoverPageState(filterId));
  },

  onActivityTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number }
    >,
  ) {
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${String(
        e.currentTarget.dataset.id ?? "1001",
      )}`,
    });
  },

  onVenueTap(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { name?: string }>,
  ) {
    wx.showToast({
      title: `${e.currentTarget.dataset.name ?? "场馆"}详情开发中`,
      icon: "none",
    });
  },

  onCreateTap() {
    wx.navigateTo({ url: "/pages/create-activity/index" });
  },
});
