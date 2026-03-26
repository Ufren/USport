type AdminDashboardSummary = {
  usersTotal: number;
  publishedActivities: number;
  openReports: number;
  inReviewReports: number;
  paidOrders: number;
  activeMembers: number;
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
const reportList = document.querySelector<HTMLDivElement>("#reportList");
const orderList = document.querySelector<HTMLDivElement>("#orderList");
const auditList = document.querySelector<HTMLDivElement>("#auditList");

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
  reportList: ensureElement(reportList, "#reportList"),
  orderList: ensureElement(orderList, "#orderList"),
  auditList: ensureElement(auditList, "#auditList"),
};

function loadConfig() {
  ui.apiBaseInput.value =
    localStorage.getItem(storageKeys.apiBase) ?? "http://127.0.0.1:8080/api/v1";
  ui.adminTokenInput.value =
    localStorage.getItem(storageKeys.token) ?? "usport-admin-dev";
  ui.adminOperatorInput.value =
    localStorage.getItem(storageKeys.operator) ?? "ops.luna";
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

function badgeClass(status: string) {
  if (status === "resolved_valid") {
    return "badge badge-danger";
  }
  if (status === "in_review") {
    return "badge badge-warning";
  }
  return "badge";
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
            <span class="${badgeClass(item.status)}">${item.statusLabel}</span>
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

async function refreshAll() {
  setStatus("正在同步后台数据...");
  try {
    const [dashboard, reports, orders, auditLogs] = await Promise.all([
      fetchApi<AdminDashboardSummary>("/admin/dashboard"),
      fetchApi<AdminReportItem[]>(
        `/admin/reports${ui.reportFilter.value ? `?status=${ui.reportFilter.value}` : ""}`,
      ),
      fetchApi<AdminMembershipOrderItem[]>("/admin/membership/orders"),
      fetchApi<AdminAuditLogItem[]>("/admin/audit-logs"),
    ]);

    renderDashboard(dashboard);
    renderReports(reports);
    renderOrders(orders);
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

void refreshAll();
