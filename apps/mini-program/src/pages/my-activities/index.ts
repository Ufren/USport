import type { MyActivityItem } from "@usport/shared";

import { activityApi } from "../../services/activity";
import { showError, showSuccess } from "../../utils/helpers";
import { setActivitySignupStatus } from "../../utils/storage";

type RoleFilter = "all" | "host" | "participant";

const roleOptions = [
  { value: "all", label: "全部" },
  { value: "host", label: "我发起的" },
  { value: "participant", label: "我报名的" },
] as const;

function buildEmptyState(role: RoleFilter): {
  title: string;
  description: string;
} {
  if (role === "host") {
    return {
      title: "还没有发起活动",
      description: "去创建第一场活动，把真正能成局的局先跑起来。",
    };
  }

  if (role === "participant") {
    return {
      title: "还没有报名活动",
      description: "去发现页看看正在成局的活动，先加入一场试试。",
    };
  }

  return {
    title: "还没有活动记录",
    description: "你的发起和报名活动会统一出现在这里，方便后续管理。",
  };
}

Page({
  data: {
    loading: true,
    role: "all" as RoleFilter,
    roleOptions,
    items: [] as MyActivityItem[],
    emptyTitle: buildEmptyState("all").title,
    emptyDescription: buildEmptyState("all").description,
  },

  onLoad() {
    void this.loadItems();
  },

  onShow() {
    void this.loadItems(this.data.role);
  },

  async loadItems(role?: RoleFilter) {
    const nextRole = role ?? this.data.role;
    this.setData({ loading: true, role: nextRole });

    try {
      const items = await activityApi.mine(nextRole);
      const emptyState = buildEmptyState(nextRole);

      this.setData({
        items,
        emptyTitle: emptyState.title,
        emptyDescription: emptyState.description,
      });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "获取活动失败");
    } finally {
      this.setData({ loading: false });
    }
  },

  onRoleTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { role?: RoleFilter }
    >,
  ) {
    const role = e.currentTarget.dataset.role ?? "all";
    void this.loadItems(role);
  },

  onActivityTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { id?: string | number }
    >,
  ) {
    const id = String(e.currentTarget.dataset.id ?? "");
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${id}`,
    });
  },

  onPrimaryAction() {
    wx.navigateTo({ url: "/pages/create-activity/index" });
  },

  onEmptyAction() {
    if (this.data.role === "host") {
      wx.navigateTo({ url: "/pages/create-activity/index" });
      return;
    }

    wx.switchTab({ url: "/pages/discover/index" });
  },

  onManageTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      {
        id?: string | number;
        action?: "cancel-registration" | "cancel-activity";
        title?: string;
      }
    >,
  ) {
    const id = String(e.currentTarget.dataset.id ?? "");
    const action = e.currentTarget.dataset.action;
    const title = String(e.currentTarget.dataset.title ?? "这场活动");

    if (!id || !action) {
      return;
    }

    const modalContent =
      action === "cancel-activity"
        ? `确定取消「${title}」吗？已报名和候补用户都会收到取消结果。`
        : `确定退出「${title}」吗？释放出的名额会自动补给候补用户。`;

    wx.showModal({
      title: action === "cancel-activity" ? "取消活动" : "退出活动",
      content: modalContent,
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        try {
          if (action === "cancel-activity") {
            await activityApi.cancelActivity(id);
            showSuccess("活动已取消");
          } else {
            await activityApi.cancelRegistration(id);
            setActivitySignupStatus(id, "none");
            showSuccess("已退出活动");
          }

          await this.loadItems(this.data.role);
        } catch (error: unknown) {
          showError(error instanceof Error ? error.message : "操作失败");
        }
      },
    });
  },
});
