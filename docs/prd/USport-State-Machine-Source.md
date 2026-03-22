# USport 状态机真源说明书

文档版本：V1.0  
更新时间：2026-03-22  
适用范围：小程序端、移动端、后台端、后端服务、测试

## 1. 文档目的

本文档定义 USport 核心业务对象的唯一状态口径，用于约束：

- 前端展示文案与可操作按钮
- 后端状态流转与权限校验
- 消息通知与异步任务触发
- 测试用例与异常分支覆盖
- 运营后台的审计与治理动作

原则：

- 同一业务对象只能有一套主状态，不允许前后端各自发明状态。
- 状态改变必须有触发主体、触发条件、审计记录和副作用定义。
- 非法状态跳转统一返回 `40900` 或对应业务错误码。
- 前端展示态可以是主状态的映射，但不得新增影响业务逻辑的“伪状态”。

## 2. 全局状态设计原则

### 2.1 统一原则

- 主状态使用稳定英文枚举值。
- 中文文案仅作为展示层映射，不进入数据库枚举。
- 所有“已删除、已归档”类动作优先使用 `is_deleted`、`archived_at` 等字段表达，不污染主状态机。

### 2.2 审计原则

以下状态迁移必须写入审计日志：

- 用户被限权、恢复、封禁
- 邀约被取消、接受、拒绝
- 活动被发布、取消、关闭、完成
- 报名被通过、拒绝、退出、候补转正
- 举报工单被接单、升级、确认、驳回、关闭
- 支付订单被关闭、退款

审计日志最少记录：

- `operator_type`
- `operator_id`
- `target_type`
- `target_id`
- `from_status`
- `to_status`
- `reason_code`
- `remark`
- `created_at`

### 2.3 状态层级

USport 建议区分三层：

1. 对象主状态：决定该对象是否可继续流转。
2. 局部履约状态：决定对象在某阶段的执行结果。
3. 风险治理状态：决定该对象是否受限。

例如活动主状态与报名状态独立，用户治理状态与用户资料完整度独立。

## 3. 用户状态机

### 3.1 用户主状态 `user_status`

| 枚举值 | 含义 | 是否可登录 | 是否可报名/发起 |
| --- | --- | --- | --- |
| `normal` | 正常 | 是 | 是 |
| `restricted` | 受限 | 是 | 否，按限权规则 |
| `banned` | 封禁 | 否 | 否 |

说明：

- “注销中” 不作为 `user_status` 枚举值，建议通过 `deletion_requested_at`、`deleted_at` 等字段表达。

### 3.2 用户认证状态 `auth_status`

| 枚举值 | 含义 |
| --- | --- |
| `unverified` | 未认证 |
| `pending` | 认证审核中 |
| `verified` | 已认证 |
| `rejected` | 认证被驳回 |

### 3.3 用户主状态流转

```text
normal --------> restricted --------> normal
  |                  |
  |                  v
  +---------------> banned
```

### 3.4 允许的状态迁移

| from | to | 触发主体 | 触发条件 | 副作用 |
| --- | --- | --- | --- | --- |
| `normal` | `restricted` | 管理员/风控系统 | 爽约、骚扰、举报成立、异常风控命中 | 关闭发起能力，必要时关闭报名能力 |
| `restricted` | `normal` | 管理员/系统 | 限权到期、人工恢复 | 恢复功能权限 |
| `normal` | `banned` | 管理员 | 严重违规、司法要求 | 强制登出，关闭全部公开资料 |
| `restricted` | `banned` | 管理员 | 重复违规或升级处罚 | 同上 |

### 3.5 禁止的状态迁移

- `banned -> normal` 不允许系统自动恢复，必须走后台人工流程。
- `restricted -> restricted` 不应作为新状态写入，应新增处罚记录。

## 4. 邀约状态机

### 4.1 邀约主状态 `invitation_status`

| 枚举值 | 含义 | 说明 |
| --- | --- | --- |
| `pending` | 待处理 | 受邀人尚未处理 |
| `accepted` | 已接受 | 双方达成初步约定 |
| `declined` | 已拒绝 | 受邀人拒绝 |
| `cancelled` | 已取消 | 发起人取消或系统取消 |
| `expired` | 已过期 | 超过有效时间未处理 |
| `completed` | 已完成 | 已转化为实际成局并完成 |

### 4.2 邀约状态流转

```text
pending --> accepted --> completed
   |           |
   |           +--> cancelled
   +--> declined
   +--> cancelled
   +--> expired
```

### 4.3 允许的状态迁移

| from | to | 触发主体 | 触发条件 | 副作用 |
| --- | --- | --- | --- | --- |
| `pending` | `accepted` | 受邀人 | 点击接受 | 建立后续活动建议或会话入口 |
| `pending` | `declined` | 受邀人 | 点击拒绝 | 通知发起人 |
| `pending` | `cancelled` | 发起人/系统 | 发起人主动取消、用户被封禁 | 通知受邀人 |
| `pending` | `expired` | 系统 | 超过响应时限 | 通知双方 |
| `accepted` | `cancelled` | 双方之一/系统 | 活动未成局、关系终止 | 记录原因 |
| `accepted` | `completed` | 系统 | 已实际成局且履约完成 | 进入评价或沉淀关系 |

### 4.4 关键规则

- 同一发起人对同一受邀人、同一运动、同一时间窗口只允许存在一个 `pending/accepted` 邀约。
- `declined/cancelled/expired` 为终态，不可再次处理。
- 邀约不等于活动，转化为活动后要建立显式关联。

## 5. 活动状态机

### 5.1 活动主状态 `activity_status`

| 枚举值 | 含义 | 是否可报名 |
| --- | --- | --- |
| `draft` | 草稿 | 否 |
| `published` | 已发布 | 是，取决于报名规则 |
| `full` | 已满员 | 否，候补开启时可候补 |
| `signup_closed` | 已截止报名 | 否 |
| `ongoing` | 进行中 | 否 |
| `completed` | 已完成 | 否 |
| `cancelled` | 已取消 | 否 |
| `closed` | 已关闭 | 否 |

### 5.2 活动状态流转

```text
draft --> published --> full ---------> ongoing --> completed --> closed
              |            |               ^
              |            +--> published -+
              +--> signup_closed ----------+
              +--> cancelled
full --------> cancelled
signup_closed -> cancelled
ongoing ------> cancelled   (仅极端场景，必须审计)
```

### 5.3 允许的状态迁移

| from | to | 触发主体 | 触发条件 | 副作用 |
| --- | --- | --- | --- | --- |
| `draft` | `published` | 发起人/后台 | 校验通过并发布 | 进入活动流推荐池 |
| `published` | `full` | 系统 | 实际确认名额达到上限 | 更新报名按钮与提示 |
| `full` | `published` | 系统 | 有人退出且仍可报名 | 恢复可报名 |
| `published` | `signup_closed` | 系统 | 达到报名截止时间 | 禁止新报名 |
| `published/full/signup_closed` | `ongoing` | 系统 | 到达开始时间 | 开启签到与履约流程 |
| `ongoing` | `completed` | 系统/发起人 | 活动结束且完成履约结算 | 触发评价、信用计算 |
| `completed` | `closed` | 系统 | 评价窗口关闭、账务完成 | 归档 |
| `published/full/signup_closed` | `cancelled` | 发起人/后台 | 场馆关闭、人数不足、违规 | 通知报名用户，必要时退款 |
| `ongoing` | `cancelled` | 后台 | 极端中止，如场馆事故 | 高优先级公告与审计 |

### 5.4 派生展示状态

前端允许映射为以下展示态：

- 报名中
- 名额紧张
- 已满员
- 已截止
- 进行中
- 已完成
- 已取消

但这些均来自主状态与名额、时间、风险字段组合，不得额外落库。

### 5.5 关键规则

- `capacity_reached` 不应单独作为数据库主状态，统一折算为 `full`。
- 活动一旦进入 `ongoing`，禁止修改时间、地点、费用等核心履约字段。
- `completed` 不等于“所有人都签到”，它表示活动生命周期完成；未签到、爽约由报名履约状态承接。

## 6. 报名状态机

### 6.1 报名主状态 `registration_status`

| 枚举值 | 含义 |
| --- | --- |
| `pending_review` | 待审核 |
| `approved` | 已通过 |
| `waitlisted` | 候补中 |
| `rejected` | 已拒绝 |
| `cancelled` | 已取消 |
| `removed` | 被主办方移出 |
| `checked_in` | 已签到 |
| `no_show` | 爽约未到 |
| `completed` | 已完成 |

### 6.2 报名状态流转

```text
pending_review --> approved --> checked_in --> completed
       |               |           |
       |               +--> cancelled
       |               +--> removed
       +--> rejected

waitlisted --> approved
waitlisted --> cancelled
approved ----> no_show
```

### 6.3 允许的状态迁移

| from | to | 触发主体 | 触发条件 | 副作用 |
| --- | --- | --- | --- | --- |
| `pending_review` | `approved` | 主办方/系统 | 审核通过或直接报名型活动 | 占用正式名额 |
| `pending_review` | `rejected` | 主办方 | 审核拒绝 | 释放名额 |
| `pending_review` | `cancelled` | 用户 | 申请人主动撤回 | 记录来源 |
| `approved` | `cancelled` | 用户 | 截止前主动退出 | 释放名额，触发候补转正 |
| `approved` | `removed` | 主办方/后台 | 违规、迟到、主办方处理 | 记录操作人 |
| `approved` | `checked_in` | 用户/主办方/系统 | 到场签到成功 | 写入履约记录 |
| `approved` | `no_show` | 系统 | 活动结束后未签到且未请假 | 扣减信用分 |
| `checked_in` | `completed` | 系统 | 活动完成结算 | 进入评价流程 |
| `waitlisted` | `approved` | 系统/主办方 | 正式名额释放 | 通知用户限时确认 |
| `waitlisted` | `cancelled` | 用户/系统 | 用户退出候补或活动取消 | 无 |

### 6.4 关键规则

- `approved` 是履约资格状态，`checked_in`、`no_show`、`completed` 是履约结果状态。
- 同一用户对同一活动只能有一条有效报名记录。
- 候补转正必须是显式状态迁移，不能直接覆盖历史报名结果。

## 7. 签到与履约状态机

### 7.1 签到状态 `checkin_status`

| 枚举值 | 含义 |
| --- | --- |
| `not_started` | 未到签到时间 |
| `available` | 可签到 |
| `checked_in` | 已签到 |
| `missed` | 错过签到 |
| `appealing` | 申诉中 |
| `waived` | 已豁免 |

### 7.2 规则

- 签到状态是报名履约状态的辅助状态，不建议作为独立主对象暴露给业务。
- `missed -> waived` 仅后台人工通过申诉后允许。
- `checked_in` 不允许回退。

## 8. 举报工单状态机

### 8.1 工单主状态 `report_status`

| 枚举值 | 含义 |
| --- | --- |
| `open` | 已创建待处理 |
| `in_review` | 审核中 |
| `escalated` | 升级处理 |
| `resolved_valid` | 已确认有效 |
| `resolved_invalid` | 已确认无效 |
| `closed` | 已关闭 |

### 8.2 状态流转

```text
open --> in_review --> escalated ------> resolved_valid --> closed
  |          |             |
  |          |             +----------> resolved_invalid --> closed
  |          +-----------------------> resolved_valid -----> closed
  +----------------------------------> resolved_invalid ---> closed
```

### 8.3 允许的状态迁移

| from | to | 触发主体 | 触发条件 | 副作用 |
| --- | --- | --- | --- | --- |
| `open` | `in_review` | 运营/风控 | 工单被受理 | 锁定处理人 |
| `open` | `escalated` | 运营/风控 | 高风险直升，如人身安全、未成年人、治安风险 | 升级审核层级并插队处理 |
| `in_review` | `escalated` | 运营/风控 | 涉及高风险、未成年人、治安等 | 升级审核层级 |
| `in_review/escalated` | `resolved_valid` | 运营/风控 | 证据成立 | 处罚目标对象 |
| `in_review/escalated` | `resolved_invalid` | 运营/风控 | 证据不足或恶意举报 | 记录结论 |
| `resolved_valid/resolved_invalid` | `closed` | 系统/运营 | 通知完成、申诉窗口结束 | 归档 |

### 8.4 关键规则

- 工单进入 `closed` 后不可再次编辑结论，只允许新增申诉工单。
- 高风险工单可直接 `open -> escalated`，但必须保留原因。

## 9. 订单与支付状态机

### 9.1 支付订单状态 `payment_order_status`

| 枚举值 | 含义 |
| --- | --- |
| `created` | 已创建待支付 |
| `paying` | 支付中 |
| `paid` | 已支付 |
| `failed` | 支付失败 |
| `closed` | 已关闭 |
| `refund_pending` | 退款中 |
| `refunded` | 已退款 |

### 9.2 允许的状态迁移

| from | to | 触发主体 | 触发条件 |
| --- | --- | --- | --- |
| `created` | `paying` | 客户端/支付网关 | 拉起支付 |
| `created/paying` | `paid` | 支付回调 | 到账成功 |
| `created/paying` | `failed` | 支付回调/系统 | 支付失败 |
| `created/failed` | `closed` | 系统 | 超时关闭 |
| `paid` | `refund_pending` | 系统/后台 | 活动取消、会员退款 |
| `refund_pending` | `refunded` | 支付回调 | 退款成功 |

### 9.3 关键规则

- 订单状态以支付回调为准，不以前端结果页为准。
- `paid` 后的业务兑现必须幂等。

## 10. 会员状态机

### 10.1 会员状态 `membership_status`

| 枚举值 | 含义 |
| --- | --- |
| `inactive` | 未开通 |
| `active` | 生效中 |
| `expired` | 已过期 |
| `suspended` | 已冻结 |
| `cancelled` | 已取消，不再续费 |

### 10.2 规则

- 会员是权益状态，不等同于订单状态。
- `active -> suspended` 用于作弊、退款争议、违规处置。
- 自动续费型产品需增加续费计划对象，不建议污染会员主状态机。

## 11. 前端按钮与状态映射原则

### 11.1 活动详情页 CTA

| 活动状态 | 报名状态 | 按钮文案 | 是否可点 |
| --- | --- | --- | --- |
| `published` | 无 | 立即报名 | 是 |
| `published` | `pending_review` | 审核中 | 否 |
| `published` | `approved` | 已报名 | 是，进入报名详情 |
| `full` | 无 | 已满员 / 候补报名 | 条件可点 |
| `signup_closed` | 任意 | 已截止 | 否 |
| `cancelled` | 任意 | 已取消 | 否 |
| `ongoing/completed/closed` | 任意 | 查看结果 | 是 |

### 11.2 邀约列表页 CTA

| 邀约状态 | 发起人按钮 | 受邀人按钮 |
| --- | --- | --- |
| `pending` | 取消 | 接受 / 拒绝 |
| `accepted` | 查看后续 | 查看后续 |
| `declined/cancelled/expired` | 查看详情 | 查看详情 |
| `completed` | 再次邀约 | 再次邀约 |

## 12. 研发落地要求

### 12.1 后端

- 数据库枚举与代码常量一一对应。
- 所有状态迁移必须经过领域服务，不允许 Controller 直接改状态。
- 提供统一的 `can_transition(from, to, actor, context)` 校验层。

### 12.2 前端

- 使用共享枚举包，不在端内硬编码状态字符串。
- 将“主状态 + 派生状态 + 权限状态”分层渲染。
- 所有 CTA 禁用原因必须可解释，不允许静默置灰。

### 12.3 测试

每个状态机至少覆盖：

1. 合法迁移
2. 非法迁移
3. 并发或重复提交
4. 权限不匹配
5. 终态重复操作
6. 状态变更后的副作用

## 13. 结论

USport 的核心不是“页面多”，而是“状态真实、口径稳定、跨端一致”。本说明书应作为活动、邀约、报名、举报、支付、信用治理的唯一状态真源；后续数据库、接口、前端实现、测试用例都必须以此为准。
