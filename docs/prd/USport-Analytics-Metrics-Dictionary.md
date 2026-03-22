# USport 埋点与指标字典

文档版本：V1.0  
更新时间：2026-03-22  
适用范围：小程序端、移动端、后台端、数据分析、增长、运营

## 1. 文档目标

本文档用于统一 USport 的事件埋点、指标口径、业务维度和看板解释，避免出现：

- 小程序和移动端事件同名不同义
- 同一个转化率由不同团队按不同分母计算
- 后台报表、运营复盘、产品结论相互矛盾

本文件是 MVP 阶段的数据真源，适合作为：

- 前端埋点实施说明
- 后端行为事件生产规则
- 数据仓库建模口径
- 经营看板定义说明

## 2. 设计原则

### 2.1 事件命名原则

- 格式：`端_页面或对象_动作`
- 小程序前缀：`mp_`
- 移动端前缀：`app_`
- 后台端前缀：`admin_`
- 服务端补偿事件前缀：`srv_`

示例：

- `mp_home_view`
- `app_partner_invite_click`
- `admin_reports_resolve_submit`
- `srv_registration_promoted_from_waitlist`

### 2.2 事件结构原则

所有事件建议采用统一结构：

```json
{
  "event_name": "mp_activity_signup_click",
  "event_time": "2026-03-22T20:30:00+08:00",
  "user_id": 123,
  "anonymous_id": "device-xxx",
  "session_id": "session-xxx",
  "page_code": "MP-ACTIVITY-DETAIL",
  "platform": "mini_program",
  "city_code": "310100",
  "props": {}
}
```

### 2.3 归因原则

- 页面曝光、点击行为优先由客户端埋点。
- 状态迁移、支付、退款、处罚、候补转正优先由服务端埋点。
- 关键转化漏斗建议同时保留客户端点击事件和服务端成功事件。

## 3. 北极星指标与护栏指标

### 3.1 北极星指标

`Weekly Completed Sessions per Active User`

中文定义：

每周活跃用户完成的有效运动局次数。

公式：

```text
北极星指标 =
周内完成的有效履约次数 / 周活跃用户数
```

说明：

- “有效履约次数”指用户处于 `registration_status=completed` 的活动参与次数。
- “周活跃用户”指 7 天内至少有一次有效访问、报名、邀约、消息、签到等关键行为的用户。
- 该指标比单纯 DAU 更能反映 USport 的真实价值是否被交付。

### 3.2 护栏指标

| 指标 | 定义 | 作用 |
| --- | --- | --- |
| 登录转化率 | 访问登录页后完成登录的用户占比 | 防止流量浪费 |
| 资料完善率 | 完成关键资料字段的登录用户占比 | 防止冷启动资料不足 |
| 报名成功率 | 发起报名后最终变成 `approved` 的占比 | 反映成局效率 |
| 到场率 | `checked_in/completed` 用户占已通过报名用户占比 | 反映履约质量 |
| 爽约率 | `no_show` 占已通过报名用户占比 | 反映风险与信用 |
| 举报率 | 有效举报量占完成活动人数比 | 反映治理压力 |
| 次周复约/复报率 | 本周完成活动用户在下周再次参加活动或发起邀约的占比 | 反映留存质量 |

## 4. 关键业务指标定义

### 4.1 流量与转化

| 指标名称 | 口径 |
| --- | --- |
| `visit_uv` | 指定周期内触发首页或发现页首屏曝光的去重用户数 |
| `login_uv` | 指定周期内完成登录成功事件的去重用户数 |
| `login_conversion_rate` | `login_uv / login_page_uv` |
| `profile_completion_rate` | 完成关键资料字段的用户数 / 登录用户数 |
| `activity_detail_ctr` | 活动卡点击用户数 / 活动卡曝光用户数 |
| `signup_click_rate` | 报名点击用户数 / 活动详情页浏览用户数 |
| `signup_success_rate` | 报名成功用户数 / 报名点击用户数 |

### 4.2 成局与履约

| 指标名称 | 口径 |
| --- | --- |
| `activity_publish_count` | 已发布活动数 |
| `activity_fill_rate` | 平均已确认人数 / 平均人数上限 |
| `activity_completion_rate` | 完成活动数 / 已发布活动数 |
| `attendance_rate` | 当前状态为 `checked_in` 或 `completed` 的报名数 / 历史进入过 `approved` 的报名数 |
| `no_show_rate` | `no_show` 报名数 / `approved` 报名数 |
| `waitlist_promotion_rate` | 候补转正数 / 候补报名总数 |
| `official_activity_share` | 官方活动完成量 / 活动完成总量 |

### 4.3 社交与关系沉淀

| 指标名称 | 口径 |
| --- | --- |
| `invitation_accept_rate` | `accepted` 邀约数 / `pending` 邀约总数 |
| `invite_to_activity_rate` | 转化为活动的邀约数 / `accepted` 邀约数 |
| `message_conversation_rate` | 有会话发送行为的完成活动用户数 / 完成活动用户数 |
| `repeat_partner_rate` | 与同一搭子二次以上成局的用户数 / 完成活动用户数 |

### 4.4 治理与安全

| 指标名称 | 口径 |
| --- | --- |
| `report_submit_rate` | 举报提交数 / 完成活动人数 |
| `report_valid_rate` | 有效举报工单数 / 已结案工单数 |
| `risk_user_ratio` | `restricted + banned` 用户数 / 累计活跃用户数 |
| `ban_after_valid_report_rate` | 被有效举报后触发封禁的用户数 / 有效举报目标用户数 |

### 4.5 商业化

| 指标名称 | 口径 |
| --- | --- |
| `membership_pay_uv` | 完成会员支付的去重用户数 |
| `membership_conversion_rate` | 会员支付 UV / 会员页访问 UV |
| `paid_order_success_rate` | `paid` 订单数 / 支付发起订单数 |
| `refund_rate` | 已退款订单数 / 已支付订单数 |

## 5. 公共事件属性字典

以下属性建议作为关键事件公共字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `page_code` | string | 页面唯一编码 |
| `page_name` | string | 页面中文名 |
| `source` | string | 行为来源，如首页、推送、分享 |
| `city_code` | string | 城市编码 |
| `district_code` | string | 区域编码 |
| `sport_code` | string | 运动类型 |
| `activity_id` | number | 活动 ID |
| `activity_type` | string | `public/private/official` |
| `invitation_id` | number | 邀约 ID |
| `registration_id` | number | 报名 ID |
| `host_user_id` | number | 主办方用户 ID |
| `auth_status` | string | 用户认证状态 |
| `user_status` | string | 用户治理状态 |
| `is_new_user` | boolean | 是否新用户 |
| `network_type` | string | 网络类型 |
| `ab_bucket` | string | 实验分桶 |

## 6. 小程序端核心事件字典

### 6.1 登录与 onboarding

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `mp_login_view` | 登录页曝光 | `source` |
| `mp_login_click` | 点击微信登录 | `agreement_checked` |
| `mp_login_success` | 登录成功 | `is_new_user` |
| `mp_login_fail` | 登录失败 | `error_code` |
| `mp_onboarding_submit` | onboarding 提交 | `completion_rate` |

### 6.2 首页与活动发现

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `mp_home_view` | 首页曝光 | `city_code` |
| `mp_home_filter_sport` | 切换运动筛选 | `sport_code` |
| `mp_home_filter_time` | 切换时间筛选 | `time_filter` |
| `mp_home_hero_click` | 点击 Hero 活动卡 | `activity_id` |
| `mp_home_activity_click` | 点击活动列表项 | `activity_id`, `card_rank` |
| `mp_home_activity_signup_click` | 首页直接点击报名 | `activity_id` |

### 6.3 活动详情与报名

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `mp_activity_detail_view` | 活动详情页曝光 | `activity_id`, `activity_status` |
| `mp_activity_signup_click` | 点击报名 | `activity_id`, `signup_entry` |
| `mp_activity_signup_success` | 报名成功 | `activity_id`, `registration_status` |
| `mp_activity_signup_fail` | 报名失败 | `activity_id`, `error_code` |
| `mp_activity_host_click` | 点击主办方 | `activity_id`, `host_user_id` |
| `mp_activity_share_click` | 点击分享 | `activity_id`, `share_channel` |
| `mp_activity_report_click` | 点击举报 | `activity_id` |

### 6.4 创建活动

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `mp_create_activity_view` | 创建页曝光 | `source` |
| `mp_create_activity_change_sport` | 修改运动类型 | `sport_code` |
| `mp_create_activity_submit` | 点击发布 | `activity_type`, `fee_type` |
| `mp_create_activity_success` | 发布成功 | `activity_id` |
| `mp_create_activity_fail` | 发布失败 | `error_code` |

## 7. 移动端核心事件字典

### 7.1 发现与搭子

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `app_discover_view` | 发现页曝光 | `mode` |
| `app_discover_switch_mode` | 切换活动/搭子模式 | `mode` |
| `app_discover_filter_change` | 修改筛选条件 | `sport_code`, `skill_level`, `district_code` |
| `app_partner_card_click` | 点击搭子卡 | `target_user_id` |
| `app_partner_invite_click` | 点击发起邀约 | `target_user_id`, `sport_code` |
| `app_partner_invite_submit` | 提交邀约 | `target_user_id`, `time_slot` |

### 7.2 活动与消息

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `app_activity_detail_view` | 活动详情曝光 | `activity_id` |
| `app_activity_chat_enter` | 进入活动会话 | `activity_id`, `conversation_id` |
| `app_messages_view` | 消息页曝光 | `tab` |
| `app_messages_conversation_click` | 点击会话 | `conversation_id` |
| `app_messages_notice_click` | 点击通知 | `notice_type` |

### 7.3 个人页与会员

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `app_me_view` | 我的页曝光 | `membership_status` |
| `app_me_click_membership` | 点击会员入口 | `membership_status` |
| `app_membership_pay_click` | 点击开通会员 | `plan_id` |
| `app_membership_pay_success` | 会员支付成功 | `plan_id`, `order_no` |
| `app_membership_pay_fail` | 会员支付失败 | `plan_id`, `error_code` |

## 8. 后台端核心事件字典

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `admin_dashboard_view` | 总览页曝光 | `city_code`, `time_range` |
| `admin_dashboard_filter_city` | 切换城市 | `city_code` |
| `admin_activity_list_view` | 活动管理页曝光 | `city_code`, `sport_code` |
| `admin_activity_cancel_submit` | 提交活动取消 | `activity_id`, `reason_code` |
| `admin_reports_view` | 举报列表曝光 | `status_filter` |
| `admin_reports_resolve_submit` | 提交举报处理 | `report_id`, `decision`, `action_type` |
| `admin_user_risk_update` | 调整用户状态 | `target_user_id`, `from_status`, `to_status` |

## 9. 服务端关键补偿事件

| 事件名 | 触发时机 | 关键属性 |
| --- | --- | --- |
| `srv_activity_status_changed` | 活动状态变化 | `activity_id`, `from_status`, `to_status` |
| `srv_registration_status_changed` | 报名状态变化 | `registration_id`, `from_status`, `to_status` |
| `srv_registration_promoted_from_waitlist` | 候补转正 | `registration_id`, `activity_id` |
| `srv_invitation_status_changed` | 邀约状态变化 | `invitation_id`, `from_status`, `to_status` |
| `srv_payment_order_paid` | 支付成功 | `order_no`, `biz_type`, `amount` |
| `srv_payment_order_refunded` | 退款成功 | `order_no`, `refund_amount` |
| `srv_user_status_changed` | 用户治理状态变化 | `user_id`, `from_status`, `to_status` |

## 10. 漏斗建议

### 10.1 新用户冷启动漏斗

```text
登录页曝光
  -> 登录成功
  -> 完成关键资料
  -> 浏览活动详情
  -> 点击报名
  -> 报名成功
  -> 到场签到
  -> 完成活动
```

### 10.2 老用户复购漏斗

```text
首页/发现页曝光
  -> 点击活动
  -> 报名成功
  -> 到场签到
  -> 完成活动
  -> 7天内再次报名/发起邀约
```

### 10.3 搭子关系沉淀漏斗

```text
搭子卡曝光
  -> 点击详情
  -> 发起邀约
  -> 邀约被接受
  -> 转化为活动
  -> 完成活动
  -> 二次复约
```

## 11. 关键维度字典

| 维度 | 示例值 | 说明 |
| --- | --- | --- |
| `platform` | `mini_program/app/admin` | 端类型 |
| `source` | `home/banner/push/share/profile` | 流量来源 |
| `sport_code` | `badminton/running/tennis/...` | 运动类型 |
| `activity_type` | `public/private/official` | 活动类型 |
| `fee_type` | `free/aa/fixed_price` | 费用模式 |
| `join_rule` | `direct/approval_required` | 报名规则 |
| `risk_level` | `low/medium/high` | 风险等级 |
| `auth_status` | `unverified/pending/verified/rejected` | 认证状态 |
| `user_status` | `normal/restricted/banned` | 治理状态 |
| `time_bucket` | `weekday_evening/weekend_afternoon` | 典型时段 |
| `city_tier` | `t1/t2/t3` | 城市层级 |

## 12. 统计口径防歧义说明

### 12.1 用户口径

- `注册用户`：数据库存在用户主记录。
- `登录用户`：周期内触发登录成功。
- `活跃用户`：周期内至少一次关键行为。
- `完成用户`：周期内至少一次完成活动。

### 12.2 活动口径

- `发布活动`：状态进入 `published` 及之后。
- `完成活动`：状态为 `completed`。
- `成局活动`：至少存在 2 个 `approved` 报名，且活动非取消。

### 12.3 报名口径

- `报名发起数`：点击并提交报名请求的次数。
- `报名成功数`：状态进入 `approved` 的报名数。
- `到场数`：进入 `checked_in` 或 `completed` 的报名数。

### 12.4 举报口径

- `举报提交量`：提交成功的工单数。
- `有效举报量`：工单状态为 `resolved_valid` 的工单数。
- `举报率`：建议按完成活动人数或完成活动数归一，不建议直接除 DAU。

## 13. 看板建议

### 13.1 创始人/产品周报看板

- 北极星指标
- 活跃用户数
- 报名成功率
- 到场率
- 爽约率
- 次周复报率
- 官方托底活动占比

### 13.2 运营治理看板

- 举报提交量
- 有效举报率
- 风险用户数
- 限权/封禁人数
- 高风险活动数

### 13.3 增长看板

- 首页 UV
- 登录转化率
- 资料完善率
- 活动详情 CTR
- 报名点击率
- 报名成功率

## 14. 实施要求

### 14.1 前端

- 事件名统一复用常量，不要散落字符串。
- 页面曝光事件只在首屏完成后上报一次，避免重复触发。
- 列表点击事件必须带排序位次和来源模块。

### 14.2 后端

- 关键状态变化必须由服务端补偿事件兜底。
- 支付、退款、处罚类事件必须幂等。
- 审计日志与埋点事件建议共享同一状态来源。

### 14.3 数据团队

- 优先建设事件明细表、用户主题表、活动主题表、报名主题表。
- 指标口径变更必须版本化记录，不允许静默换算。

## 15. 结论

USport 的数据体系不应只回答“多少人来过”，更要回答“多少人真的成局、到场、复约、留存”。本字典应作为多端埋点、服务端事件和经营指标的唯一口径基础。
