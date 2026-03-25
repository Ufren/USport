import type { CreateActivityFormDraft } from "@usport/shared";
import { buildCreatedActivityDetail } from "@usport/shared";

import { activityApi } from "../../services/activity";
import {
  createDraftFromPartial,
  saveCreatedActivity,
} from "../../features/activity-flow/storage";
import { showError, showSuccess } from "../../utils/helpers";
import { getUserInfo } from "../../utils/storage";
import {
  buildCreateActivityPageState,
  validateCreateActivityDraft,
} from "./presenter";

const initialDraft = createDraftFromPartial();

Page({
  data: {
    submitting: false,
    currentUserName: "",
    ...buildCreateActivityPageState(initialDraft),
  },

  onLoad() {
    const userInfo = getUserInfo();

    if (!userInfo?.id) {
      wx.showToast({
        title: "请先登录再发起活动",
        icon: "none",
      });
      setTimeout(() => {
        wx.navigateTo({ url: "/pages/auth/index" });
      }, 1200);
      return;
    }

    const currentUserName =
      userInfo.nickname || userInfo.phone || userInfo.openid || "你";

    this.setData({
      currentUserName,
    });
  },

  // 统一从这里刷新表单状态，避免每个事件里重复拼接页面数据。
  applyDraft(nextDraft: CreateActivityFormDraft) {
    this.setData({
      ...buildCreateActivityPageState(nextDraft),
    });
  },

  onFieldInput(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { field?: keyof CreateActivityFormDraft }
    > & {
      detail: { value: string };
    },
  ) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }

    this.applyDraft({
      ...this.data.draft,
      [field]: e.detail.value,
    });
  },

  onDateChange(e: WechatMiniprogram.CustomEvent<{ value: string }>) {
    this.applyDraft({
      ...this.data.draft,
      date: e.detail.value,
    });
  },

  onTimeChange(
    e: WechatMiniprogram.CustomEvent<
      { value: string },
      { field?: "startTime" | "endTime" | "deadlineTime" }
    >,
  ) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }

    this.applyDraft({
      ...this.data.draft,
      [field]: e.detail.value,
    });
  },

  onOptionSelect(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { field?: keyof CreateActivityFormDraft; value?: string }
    >,
  ) {
    const field = e.currentTarget.dataset.field;
    const value = e.currentTarget.dataset.value;

    if (!field || !value) {
      return;
    }

    this.applyDraft({
      ...this.data.draft,
      [field]: value,
    });
  },

  onStepperTap(
    e: WechatMiniprogram.CustomEvent<
      Record<string, never>,
      { field?: "capacity" | "waitlistCapacity"; delta?: string }
    >,
  ) {
    const field = e.currentTarget.dataset.field;
    const delta = Number(e.currentTarget.dataset.delta ?? 0);

    if (!field || !delta) {
      return;
    }

    const currentValue =
      field === "capacity"
        ? this.data.draft.capacity
        : this.data.draft.waitlistCapacity;
    const nextValue = Math.max(
      field === "capacity" ? 2 : 0,
      Math.min(field === "capacity" ? 99 : 20, currentValue + delta),
    );

    this.applyDraft({
      ...this.data.draft,
      [field]: nextValue,
    });
  },

  onSubmit() {
    void this.handleSubmit();
  },

  async handleSubmit() {
    if (this.data.submitting) {
      return;
    }

    const validationResult = validateCreateActivityDraft(this.data.draft);
    if (!validationResult.isValid) {
      this.setData({
        ...buildCreateActivityPageState(
          this.data.draft,
          validationResult.fieldErrors,
        ),
      });

      wx.showToast({
        title: validationResult.firstError,
        icon: "none",
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      const createdActivity = await activityApi.create(this.data.draft);
      saveCreatedActivity(
        buildCreatedActivityDetail(this.data.draft, this.data.currentUserName),
      );

      showSuccess("活动已发布");

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/activity-detail/index?id=${String(
            createdActivity.sourceActivityId ?? createdActivity.id,
          )}`,
        });
      }, 900);
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "发布活动失败");
      this.setData({ submitting: false });
    }
  },
});
