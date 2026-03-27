type AdminDashboardSummary = {
  usersTotal: number;
  publishedActivities: number;
  openReports: number;
  inReviewReports: number;
  paidOrders: number;
  activeMembers: number;
};

type AdminActivityItem = {
  id: number;
  title: string;
  isOfficial: boolean;
  hostName: string;
  sportLabel: string;
  status: string;
  statusLabel: string;
  startTimeLabel: string;
  venueName: string;
  district: string;
  participantHint: string;
};

type AdminReportItem = {
  id: number;
  reporterUserId: number;
  reporterName: string;
  targetType: string;
  targetId: number;
  reasonCode: string;
  description: string;
  status: string;
  statusLabel: string;
  createdAtLabel: string;
  canResolve: boolean;
  canEscalate: boolean;
};

type AdminMembershipOrderItem = {
  id: number;
  userId: number;
  planCode: string;
  amountLabel: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  canRefund?: boolean;
};

type AdminAuditLogItem = {
  id: number;
  operator: string;
  actionCode: string;
  targetType: string;
  targetId: number;
  detail: string;
  createdAt: string;
};

type AdminOfficialActivityItem = {
  id: number;
  title: string;
  sportLabel: string;
  startTimeLabel: string;
  venueName: string;
  district: string;
  participantHint: string;
};

type CreateOfficialActivityRequest = {
  sportCode: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  deadlineTime: string;
  district: string;
  venueName: string;
  capacity: number;
  waitlistCapacity: number;
  feeType: string;
  feeAmount: string;
  joinRule: string;
  visibility: string;
};

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const storageKeys = {
  apiBase: "usport-admin-api-base",
  token: "usport-admin-token",
  operator: "usport-admin-operator",
} as const;

const apiBaseInput = document.querySelector<HTMLInputElement>("#apiBase");
const adminTokenInput = document.querySelector<HTMLInputElement>("#adminToken");
const adminOperatorInput =
  document.querySelector<HTMLInputElement>("#adminOperator");
const reloadButton = document.querySelector<HTMLButtonElement>("#reloadButton");
const refreshDashboardButton = document.querySelector<HTMLButtonElement>(
  "#refreshDashboardButton",
);
const reportFilter = document.querySelector<HTMLSelectElement>("#reportFilter");
const statusText = document.querySelector<HTMLParagraphElement>("#statusText");
const dashboardGrid = document.querySelector<HTMLDivElement>("#dashboardGrid");
const activityList = document.querySelector<HTMLDivElement>("#activityList");
const reportList = document.querySelector<HTMLDivElement>("#reportList");
const orderList = document.querySelector<HTMLDivElement>("#orderList");
const auditList = document.querySelector<HTMLDivElement>("#auditList");
const officialSportCode =
  document.querySelector<HTMLSelectElement>("#officialSportCode");
const officialTitle =
  document.querySelector<HTMLInputElement>("#officialTitle");
const officialDescription = document.querySelector<HTMLTextAreaElement>(
  "#officialDescription",
);
const officialDate = document.querySelector<HTMLInputElement>("#officialDate");
const officialStartTime =
  document.querySelector<HTMLInputElement>("#officialStartTime");
const officialEndTime =
  document.querySelector<HTMLInputElement>("#officialEndTime");
const officialDeadlineTime = document.querySelector<HTMLInputElement>(
  "#officialDeadlineTime",
);
const officialDistrict =
  document.querySelector<HTMLInputElement>("#officialDistrict");
const officialVenueName =
  document.querySelector<HTMLInputElement>("#officialVenueName");
const officialCapacity =
  document.querySelector<HTMLInputElement>("#officialCapacity");
const officialWaitlistCapacity = document.querySelector<HTMLInputElement>(
  "#officialWaitlistCapacity",
);
const officialFeeType =
  document.querySelector<HTMLSelectElement>("#officialFeeType");
const officialFeeAmount =
  document.querySelector<HTMLInputElement>("#officialFeeAmount");
const officialJoinRule =
  document.querySelector<HTMLSelectElement>("#officialJoinRule");
const officialVisibility = document.querySelector<HTMLSelectElement>(
  "#officialVisibility",
);
const officialCreateButton = document.querySelector<HTMLButtonElement>(
  "#officialCreateButton",
);
const officialResult =
  document.querySelector<HTMLParagraphElement>("#officialResult");

function ensureElement<T extends Element>(
  element: T | null,
  selector: string,
): T {
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

const ui = {
  apiBaseInput: ensureElement(apiBaseInput, "#apiBase"),
  adminTokenInput: ensureElement(adminTokenInput, "#adminToken"),
  adminOperatorInput: ensureElement(adminOperatorInput, "#adminOperator"),
  reloadButton: ensureElement(reloadButton, "#reloadButton"),
  refreshDashboardButton: ensureElement(
    refreshDashboardButton,
    "#refreshDashboardButton",
  ),
  reportFilter: ensureElement(reportFilter, "#reportFilter"),
  statusText: ensureElement(statusText, "#statusText"),
  dashboardGrid: ensureElement(dashboardGrid, "#dashboardGrid"),
  activityList: ensureElement(activityList, "#activityList"),
  reportList: ensureElement(reportList, "#reportList"),
  orderList: ensureElement(orderList, "#orderList"),
  auditList: ensureElement(auditList, "#auditList"),
  officialSportCode: ensureElement(officialSportCode, "#officialSportCode"),
  officialTitle: ensureElement(officialTitle, "#officialTitle"),
  officialDescription: ensureElement(
    officialDescription,
    "#officialDescription",
  ),
  officialDate: ensureElement(officialDate, "#officialDate"),
  officialStartTime: ensureElement(officialStartTime, "#officialStartTime"),
  officialEndTime: ensureElement(officialEndTime, "#officialEndTime"),
  officialDeadlineTime: ensureElement(
    officialDeadlineTime,
    "#officialDeadlineTime",
  ),
  officialDistrict: ensureElement(officialDistrict, "#officialDistrict"),
  officialVenueName: ensureElement(officialVenueName, "#officialVenueName"),
  officialCapacity: ensureElement(officialCapacity, "#officialCapacity"),
  officialWaitlistCapacity: ensureElement(
    officialWaitlistCapacity,
    "#officialWaitlistCapacity",
  ),
  officialFeeType: ensureElement(officialFeeType, "#officialFeeType"),
  officialFeeAmount: ensureElement(officialFeeAmount, "#officialFeeAmount"),
  officialJoinRule: ensureElement(officialJoinRule, "#officialJoinRule"),
  officialVisibility: ensureElement(officialVisibility, "#officialVisibility"),
  officialCreateButton: ensureElement(
    officialCreateButton,
    "#officialCreateButton",
  ),
  officialResult: ensureElement(officialResult, "#officialResult"),
};

function loadConfig() {
  ui.apiBaseInput.value =
    localStorage.getItem(storageKeys.apiBase) ?? "http://127.0.0.1:8080/api/v1";
  ui.adminTokenInput.value =
    localStorage.getItem(storageKeys.token) ?? "usport-admin-dev";
  ui.adminOperatorInput.value =
    localStorage.getItem(storageKeys.operator) ?? "ops.luna";
  if (!ui.officialDate.value) {
    ui.officialDate.value = new Date().toISOString().slice(0, 10);
  }
}

function saveConfig() {
  localStorage.setItem(storageKeys.apiBase, ui.apiBaseInput.value.trim());
  localStorage.setItem(storageKeys.token, ui.adminTokenInput.value.trim());
  localStorage.setItem(
    storageKeys.operator,
    ui.adminOperatorInput.value.trim(),
  );
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  saveConfig();

  const response = await fetch(`${ui.apiBaseInput.value.trim()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ui.adminTokenInput.value.trim(),
      "X-Admin-Operator": ui.adminOperatorInput.value.trim(),
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || "后台请求失败");
  }

  return payload.data;
}

function setStatus(message: string, isError = false) {
  ui.statusText.textContent = message;
  ui.statusText.style.color = isError ? "#b93a32" : "#66716a";
}

function setOfficialResult(message: string, isError = false) {
  ui.officialResult.textContent = message;
  ui.officialResult.style.color = isError ? "#b93a32" : "#66716a";
}

function buildOfficialActivityRequest(): CreateOfficialActivityRequest {
  return {
    sportCode: ui.officialSportCode.value,
    title: ui.officialTitle.value.trim(),
    description: ui.officialDescription.value.trim(),
    date: ui.officialDate.value,
    startTime: ui.officialStartTime.value,
    endTime: ui.officialEndTime.value,
    deadlineTime: ui.officialDeadlineTime.value,
    district: ui.officialDistrict.value.trim(),
    venueName: ui.officialVenueName.value.trim(),
    capacity: Number(ui.officialCapacity.value || 0),
    waitlistCapacity: Number(ui.officialWaitlistCapacity.value || 0),
    feeType: ui.officialFeeType.value,
    feeAmount: ui.officialFeeAmount.value.trim(),
    joinRule: ui.officialJoinRule.value,
    visibility: ui.officialVisibility.value,
  };
}

async function submitOfficialActivity() {
  ui.officialCreateButton.disabled = true;
  ui.officialCreateButton.textContent = "发布中...";
  setOfficialResult("正在创建官方活动...");

  try {
    const payload = buildOfficialActivityRequest();
    const item = await fetchApi<AdminOfficialActivityItem>(
      "/admin/activities",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    setOfficialResult(
      `已发布：${item.title} / ${item.startTimeLabel} / ${item.participantHint}`,
    );
    setStatus("后台数据同步完成");
    await refreshAll();
  } catch (error) {
    const message = error instanceof Error ? error.message : "官方活动创建失败";
    setOfficialResult(message, true);
    setStatus(message, true);
  } finally {
    ui.officialCreateButton.disabled = false;
    ui.officialCreateButton.textContent = "发布官方活动";
  }
}

function renderEmpty(container: HTMLElement, message: string) {
  container.innerHTML = `<div class="empty">${message}</div>`;
}

function renderDashboard(summary: AdminDashboardSummary) {
  const items = [
    { label: "用户总数", value: summary.usersTotal },
    { label: "上架活动", value: summary.publishedActivities },
    { label: "待处理举报", value: summary.openReports },
    { label: "处理中举报", value: summary.inReviewReports },
    { label: "已支付订单", value: summary.paidOrders },
    { label: "有效会员", value: summary.activeMembers },
  ];

  ui.dashboardGrid.innerHTML = items
    .map(
      (item) => `
        <article class="metric-card">
          <div class="metric-label">${item.label}</div>
          <div class="metric-value">${item.value}</div>
        </article>
      `,
    )
    .join("");
}

function renderActivities(items: AdminActivityItem[]) {
  if (!items.length) {
    renderEmpty(ui.activityList, "暂无活动记录。");
    return;
  }

  ui.activityList.innerHTML = items
    .map(
      (item) => `
        <article class="order-card">
          <div class="card-top">
            <div>
              <h4>${item.isOfficial ? "官方" : "用户"}活动 #${item.id}</h4>
              <p class="meta">${item.sportLabel} / ${item.district} / ${item.venueName}</p>
            </div>
            <span class="${badgeClass(item.status)}">${item.statusLabel}</span>
          </div>
          <p class="card-copy">${item.title}</p>
          <p class="meta">主办方：${item.hostName}</p>
          <p class="meta">${item.startTimeLabel}</p>
          <p class="meta">${item.participantHint}</p>
        </article>
      `,
    )
    .join("");
}

function badgeClass(status: string) {
  if (status === "resolved_valid") {
    return "badge badge-danger";
  }
  if (status === "in_review") {
    return "badge badge-warning";
  }
  return "badge";
}

function formatOrderStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "已支付";
    case "refunded":
      return "已退款";
    case "failed":
      return "支付失败";
    case "closed":
      return "已关闭";
    default:
      return "待支付";
  }
}

function renderReports(items: AdminReportItem[]) {
  if (!items.length) {
    renderEmpty(ui.reportList, "当前筛选条件下没有举报工单。");
    return;
  }

  ui.reportList.innerHTML = items
    .map(
      (item) => `
        <article class="report-card" data-report-id="${item.id}">
          <div class="card-top">
            <div>
              <h4>举报 #${item.id} · ${item.reasonCode}</h4>
              <p class="meta">举报人：${item.reporterName || `用户 ${item.reporterUserId}`} · 对象：${item.targetType} / ${item.targetId}</p>
            </div>
            <span class="${badgeClass(item.status)}">${formatOrderStatusLabel(item.status)}</span>
          </div>
          <p class="card-copy">${item.description || "未填写补充说明"}</p>
          <p class="meta">创建时间：${item.createdAtLabel}</p>
          <div class="decision-grid">
            <select class="select js-decision">
              <option value="in_review">转处理中</option>
              <option value="resolved_valid">判定有效</option>
              <option value="resolved_invalid">判定无效</option>
              <option value="closed">关闭工单</option>
            </select>
            <textarea class="js-note" placeholder="填写处理说明，便于后续审计追溯。"></textarea>
            <button class="decision-button js-submit">提交处理</button>
          </div>
        </article>
      `,
    )
    .join("");

  ui.reportList
    .querySelectorAll<HTMLElement>(".report-card")
    .forEach((card) => {
      const button = card.querySelector<HTMLButtonElement>(".js-submit");
      const select = card.querySelector<HTMLSelectElement>(".js-decision");
      const note = card.querySelector<HTMLTextAreaElement>(".js-note");
      if (!button || !select || !note) {
        return;
      }

      button.addEventListener("click", async () => {
        const reportId = Number(card.dataset.reportId);
        button.disabled = true;
        button.textContent = "提交中...";
        try {
          await fetchApi(`/admin/reports/${reportId}/decision`, {
            method: "POST",
            body: JSON.stringify({
              decision: select.value,
              note: note.value.trim(),
            }),
          });
          setStatus(`举报 #${reportId} 已完成处理`);
          await refreshAll();
        } catch (error) {
          setStatus(
            error instanceof Error ? error.message : "提交处理失败",
            true,
          );
        } finally {
          button.disabled = false;
          button.textContent = "提交处理";
        }
      });
    });
}

function renderOrders(items: AdminMembershipOrderItem[]) {
  if (!items.length) {
    renderEmpty(ui.orderList, "暂无会员订单。");
    return;
  }

  ui.orderList.innerHTML = items
    .map(
      (item) => `
        <article class="order-card">
          <div class="card-top">
            <div>
              <h4>订单 #${item.id}</h4>
              <p class="meta">用户 ${item.userId} · 套餐 ${item.planCode}</p>
            </div>
            <span class="${badgeClass(item.status)}">${item.statusLabel}</span>
          </div>
          <p class="card-copy">${item.amountLabel}</p>
          <p class="meta">${item.createdAt}</p>
        </article>
      `,
    )
    .join("");
}

function renderAuditLogs(items: AdminAuditLogItem[]) {
  if (!items.length) {
    renderEmpty(ui.auditList, "暂无后台操作日志。");
    return;
  }

  ui.auditList.innerHTML = items
    .map(
      (item) => `
        <article class="audit-card">
          <div class="card-top">
            <div>
              <h4>${item.actionCode}</h4>
              <p class="meta">${item.operator} · ${item.targetType} / ${item.targetId}</p>
            </div>
            <span class="badge">${item.createdAt}</span>
          </div>
          <p class="card-copy">${item.detail || "无补充说明"}</p>
        </article>
      `,
    )
    .join("");
}

void renderOrders;

function renderOrdersClean(items: AdminMembershipOrderItem[]) {
  if (!items.length) {
    renderEmpty(ui.orderList, "暂无会员订单。");
    return;
  }

  ui.orderList.innerHTML = items
    .map(
      (item) => `
        <article class="order-card" data-order-id="${item.id}">
          <div class="card-top">
            <div>
              <h4>订单 #${item.id}</h4>
              <p class="meta">用户 ${item.userId} / 套餐 ${item.planCode}</p>
            </div>
            <span class="${badgeClass(item.status)}">${item.statusLabel}</span>
          </div>
          <p class="card-copy">${item.amountLabel}</p>
          <p class="meta">${item.createdAt}</p>
          ${
            (item.canRefund ?? item.status === "paid")
              ? '<button class="decision-button js-refund">发起退款</button>'
              : ""
          }
        </article>
      `,
    )
    .join("");

  ui.orderList.querySelectorAll<HTMLElement>(".order-card").forEach((card) => {
    const button = card.querySelector<HTMLButtonElement>(".js-refund");
    if (!button) {
      return;
    }

    button.addEventListener("click", async () => {
      const orderId = Number(card.dataset.orderId);
      button.disabled = true;
      button.textContent = "退款中...";
      try {
        await fetchApi(`/admin/membership/orders/${orderId}/refund`, {
          method: "POST",
        });
        setStatus(`会员订单 #${orderId} 已完成退款`);
        await refreshAll();
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "会员订单退款失败",
          true,
        );
      } finally {
        button.disabled = false;
        button.textContent = "发起退款";
      }
    });
  });
}

async function refreshAll() {
  setStatus("正在同步后台数据...");
  try {
    const [dashboard, activities, reports, orders, auditLogs] =
      await Promise.all([
        fetchApi<AdminDashboardSummary>("/admin/dashboard"),
        fetchApi<AdminActivityItem[]>("/admin/activities"),
        fetchApi<AdminReportItem[]>(
          `/admin/reports${ui.reportFilter.value ? `?status=${ui.reportFilter.value}` : ""}`,
        ),
        fetchApi<AdminMembershipOrderItem[]>("/admin/membership/orders"),
        fetchApi<AdminAuditLogItem[]>("/admin/audit-logs"),
      ]);

    renderDashboard(dashboard);
    renderActivities(activities);
    renderReports(reports);
    renderOrdersClean(orders);
    renderAuditLogs(auditLogs);
    setStatus("后台数据同步完成");
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : "后台数据同步失败",
      true,
    );
  }
}

loadConfig();
ui.reloadButton.addEventListener("click", () => void refreshAll());
ui.refreshDashboardButton.addEventListener("click", () => void refreshAll());
ui.reportFilter.addEventListener("change", () => void refreshAll());
ui.officialCreateButton.addEventListener(
  "click",
  () => void submitOfficialActivity(),
);

void refreshAll();
