import type { MyActivityItem } from "@usport/shared";

import { activityApi } from "../../services/activity";
import { showError, showSuccess } from "../../utils/helpers";
import { setActivitySignupStatus } from "../../utils/storage";

type RoleFilter = "all" | "host" | "participant";
type ActivityAction =
  | "cancel-registration"
  | "cancel-activity"
  | "check-in"
  | "finish";

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

function buildStatusLabel(item: MyActivityItem): string {
  if (item.role === "host") {
    return item.canFinish ? "待完赛" : "主办方";
  }

  switch (item.registrationStatus) {
    case "waitlisted":
      return "候补中";
    case "checked_in":
      return "已签到";
    case "finished":
      return "已完赛";
    default:
      return "已报名";
  }
}

function buildActionConfig(item: MyActivityItem):
  | {
      action: ActivityAction;
      title: string;
      content: string;
      success: string;
      label: string;
    }
  | undefined {
  if (item.canFinish) {
    return {
      action: "finish",
      title: "完赛确认",
      content: `确定将「${item.title}」标记为已完赛吗？系统会同步收口参与者状态。`,
      success: "活动已完赛",
      label: "完赛收口",
    };
  }

  if (item.canCheckIn) {
    return {
      action: "check-in",
      title: "活动签到",
      content: `确定为「${item.title}」完成签到吗？签到后会进入履约状态。`,
      success: "签到成功",
      label: "立即签到",
    };
  }

  if (item.canManage) {
    return {
      action: "cancel-activity",
      title: "取消活动",
      content: `确定取消「${item.title}」吗？已报名和候补用户都会收到取消结果。`,
      success: "活动已取消",
      label: "取消活动",
    };
  }

  if (item.canCancel) {
    return {
      action: "cancel-registration",
      title: "退出活动",
      content: `确定退出「${item.title}」吗？释放出的名额会自动补给候补用户。`,
      success: "已退出活动",
      label: "退出活动",
    };
  }

  return undefined;
}

Page({
  data: {
    loading: true,
    role: "all" as RoleFilter,
    roleOptions,
    items: [] as Array<
      MyActivityItem & { statusLabel: string; actionLabel: string }
    >,
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
        items: items.map((item) => {
          const actionConfig = buildActionConfig(item);
          return {
            ...item,
            statusLabel: buildStatusLabel(item),
            actionLabel: actionConfig?.label ?? "",
          };
        }),
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
        title?: string;
      }
    >,
  ) {
    const id = String(e.currentTarget.dataset.id ?? "");
    const title = String(e.currentTarget.dataset.title ?? "这场活动");
    const currentItem = this.data.items.find((item) => String(item.id) === id);

    if (!id || !currentItem) {
      return;
    }

    const actionConfig = buildActionConfig(currentItem);
    if (!actionConfig) {
      return;
    }

    wx.showModal({
      title: actionConfig.title,
      content: actionConfig.content.replace(currentItem.title, title),
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        try {
          switch (actionConfig.action) {
            case "cancel-activity":
              await activityApi.cancelActivity(id);
              break;
            case "cancel-registration":
              await activityApi.cancelRegistration(id);
              setActivitySignupStatus(id, "none");
              break;
            case "check-in":
              await activityApi.checkIn(id);
              setActivitySignupStatus(id, "checked_in");
              break;
            case "finish":
              await activityApi.finish(id);
              setActivitySignupStatus(id, "finished");
              break;
          }

          showSuccess(actionConfig.success);
          await this.loadItems(this.data.role);
        } catch (error: unknown) {
          showError(error instanceof Error ? error.message : "操作失败");
        }
      },
    });
  },
});
