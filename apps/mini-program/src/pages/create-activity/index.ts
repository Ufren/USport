import type { CreateActivityFormDraft } from "@usport/shared";
import { buildCreatedActivityDetail } from "@usport/shared";

import {
  createDraftFromPartial,
  saveCreatedActivity,
} from "../../features/activity-flow/storage";
import { showSuccess } from "../../utils/helpers";
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
        title: "\u8bf7\u5148\u767b\u5f55\u518d\u53d1\u8d77\u6d3b\u52a8",
        icon: "none",
      });
      setTimeout(() => {
        wx.navigateTo({ url: "/pages/auth/index" });
      }, 1200);
      return;
    }

    const currentUserName =
      userInfo.nickname || userInfo.phone || userInfo.openid || "\u4f60";

    this.setData({
      currentUserName,
    });
  },

  // \u7edf\u4e00\u4ece\u8fd9\u91cc\u5237\u65b0\u8868\u5355\u72b6\u6001\uff0c\u907f\u514d\u6bcf\u4e2a\u4e8b\u4ef6\u91cc\u91cd\u590d\u62fc\u63a5\u9875\u9762\u6570\u636e\u3002
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

    const createdActivity = buildCreatedActivityDetail(
      this.data.draft,
      this.data.currentUserName,
    );
    saveCreatedActivity(createdActivity);

    showSuccess("\u6d3b\u52a8\u5df2\u53d1\u5e03");

    setTimeout(() => {
      wx.redirectTo({ url: "/pages/activity-detail/index?id=created" });
    }, 900);
  },
});
