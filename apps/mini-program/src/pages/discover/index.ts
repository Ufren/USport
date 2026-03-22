import { buildDiscoverPageState } from "./presenter";

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
    // 首页筛选只影响推荐列表，不动 Hero，保证首页始终有一个稳定主视觉。
    this.setData(buildDiscoverPageState(filterId));
  },

  onActivityTap(
    e: WechatMiniprogram.CustomEvent<Record<string, never>, { title?: string }>,
  ) {
    wx.showToast({
      title: `${e.currentTarget.dataset.title ?? "活动"}详情开发中`,
      icon: "none",
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
});
