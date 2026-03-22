# USport 接口说明书

文档版本：V1.0  
更新时间：2026-03-22  
适用范围：MVP 目标接口规范

## 1. 说明

本文档定义的是 USport 的目标 API 规范，用于指导后续后端实现、小程序端与移动端联调。

当前仓库已实现的接口只有：

- `GET /api/v1/health`
- `POST /api/v1/users/wechat_login`
- `POST /api/v1/users/phone_login`
- `GET /api/v1/users/:id`

下文定义的是推荐的统一化协议，建议后续逐步迁移到本规范。

## 2. 通用协议

### 2.1 Base URL

- 生产：`/api/v1`
- 预发：`/api/v1`

### 2.2 响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 2.3 鉴权

Header：

```http
Authorization: Bearer <token>
```

### 2.4 分页

请求参数：

- `page`：页码，从 `1` 开始
- `page_size`：每页条数，默认 `20`，最大 `50`

分页响应结构建议：

```json
{
  "list": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "has_more": true
  }
}
```

### 2.5 通用错误码

| code | 含义 |
| --- | --- |
| 0 | 成功 |
| 40000 | 通用参数错误 |
| 40100 | 未登录 |
| 40101 | Token 无效 |
| 40300 | 无权限 |
| 40400 | 资源不存在 |
| 40900 | 状态冲突 |
| 42900 | 请求过频 |
| 50000 | 服务异常 |
| 60010 | 微信授权失败 |
| 60020 | 手机号授权失败 |
| 61010 | 用户资料未完善 |
| 62010 | 邀约状态非法 |
| 63010 | 活动已满员 |
| 63020 | 活动已截止报名 |
| 63030 | 活动状态不允许报名 |
| 64010 | 举报重复提交 |
| 65010 | 订单状态非法 |

## 3. 鉴权与用户

### 3.1 微信登录

`POST /auth/wechat-login`

请求体：

```json
{
  "code": "wx-login-code"
}
```

响应：

```json
{
  "token": "jwt-token",
  "is_new_user": true,
  "user": {
    "id": 1,
    "nickname": "",
    "avatar_url": "",
    "phone": "",
    "auth_status": 0,
    "user_status": 1
  }
}
```

规则：

- `code` 必填。
- 微信授权失败返回 `60010`。
- 首次登录创建用户主记录。

### 3.2 手机号绑定登录

`POST /auth/phone-login`

请求体：

```json
{
  "code": "wx-phone-code"
}
```

规则：

- 仅已拿到有效微信身份的用户可完成手机号绑定。
- 成功后补充 `phone` 字段。
- 失败返回 `60020`。

### 3.3 获取当前用户

`GET /users/me`

响应字段：

- `id`
- `nickname`
- `avatar_url`
- `gender`
- `city_code`
- `phone`
- `auth_status`
- `user_status`
- `credit_score`
- `profile_completion_rate`

### 3.4 获取用户详情

`GET /users/{user_id}`

规则：

- 公开资料可查看。
- 私密字段按 `visibility_scope` 控制。
- 被拉黑时返回最小化资料或 `40300`。

### 3.5 更新基础资料

`PUT /users/me/basic-profile`

请求体：

```json
{
  "nickname": "阿杰",
  "avatar_url": "https://...",
  "gender": 1,
  "city_code": "310100"
}
```

规则：

- 昵称长度 2 到 20。
- 昵称需经过敏感词校验。

### 3.6 更新扩展资料

`PUT /users/me/profile`

请求体：

```json
{
  "bio": "想找羽毛球和跑步搭子",
  "birth_year": 1997,
  "residence_district": "浦东新区",
  "friendship_goal": "training",
  "allow_invite": true,
  "visibility_scope": "public"
}
```

### 3.7 更新运动画像

`PUT /users/me/sport-profiles`

请求体：

```json
{
  "items": [
    {
      "sport_code": "badminton",
      "skill_level": "intermediate",
      "frequency_per_week": 2,
      "preferred_scene": "casual",
      "preferred_districts": ["pudong", "jingan"],
      "preferred_time_slots": ["weekday_evening", "weekend_afternoon"],
      "is_primary": true
    }
  ]
}
```

## 4. 发现与邀约

### 4.1 发现搭子列表

`GET /discover/users`

查询参数：

- `sport_code`
- `city_code`
- `district_code`
- `skill_level`
- `gender`
- `page`
- `page_size`

返回字段：

- `user_id`
- `nickname`
- `avatar_url`
- `city_code`
- `common_sports`
- `primary_skill_level`
- `match_reasons`

规则：

- 自动过滤自己。
- 自动过滤被拉黑关系。
- 默认只返回可邀约用户。

### 4.2 创建邀约

`POST /invitations`

请求体：

```json
{
  "invitee_id": 2,
  "sport_code": "badminton",
  "expected_date": "2026-03-28",
  "expected_time_slot": "weekend_afternoon",
  "district_code": "pudong",
  "venue_hint": "离地铁近",
  "message": "周六下午有空一起打吗？"
}
```

规则：

- 不能向自己发起。
- 不能向已拉黑对象发起。
- 同一窗口内重复邀约返回 `62010`。

### 4.3 我的邀约列表

`GET /invitations`

查询参数：

- `type`：`sent` / `received`
- `status`
- `page`
- `page_size`

### 4.4 邀约详情

`GET /invitations/{invitation_id}`

### 4.5 处理邀约

`POST /invitations/{invitation_id}/decision`

请求体：

```json
{
  "action": "accept"
}
```

可选值：

- `accept`
- `decline`
- `cancel`

规则：

- 发起人只能取消。
- 接收人只能接受或拒绝。
- 非 `pending` 状态不可再次处理。

## 5. 活动与报名

### 5.1 活动列表

`GET /activities`

查询参数：

- `city_code`
- `sport_code`
- `district_code`
- `activity_type`
- `start_date`
- `end_date`
- `joinable_only`
- `page`
- `page_size`

返回字段：

- `id`
- `title`
- `sport_code`
- `activity_type`
- `start_time`
- `district_code`
- `capacity`
- `current_count`
- `fee_type`
- `status`
- `host`

### 5.2 活动详情

`GET /activities/{activity_id}`

重点返回：

- 基础信息
- 发起人信息
- 报名状态
- 是否可报名
- 费用信息
- 风险提示

### 5.3 创建活动

`POST /activities`

请求体：

```json
{
  "activity_type": "public",
  "sport_code": "badminton",
  "title": "周三晚羽毛球搭子局",
  "description": "4 缺 2，偏中级友好局",
  "city_code": "310100",
  "district_code": "pudong",
  "venue_id": 101,
  "start_time": "2026-03-25T19:30:00+08:00",
  "end_time": "2026-03-25T21:30:00+08:00",
  "signup_deadline": "2026-03-25T17:00:00+08:00",
  "capacity": 4,
  "waiting_capacity": 2,
  "fee_type": "aa",
  "join_rule": "approval_required",
  "visibility_scope": "public",
  "min_skill_level": "intermediate",
  "gender_rule": "all"
}
```

规则：

- 开始时间必须晚于当前时间。
- `signup_deadline` 不能晚于 `start_time`。
- 高风险场景需认证用户才能发起。

### 5.4 更新活动

`PUT /activities/{activity_id}`

规则：

- 仅发起人可更新。
- 已开始活动不可修改核心履约字段。

### 5.5 取消活动

`POST /activities/{activity_id}/cancel`

请求体：

```json
{
  "reason": "场地临时关闭"
}
```

规则：

- 已完成活动不可取消。
- 涉及支付时需触发退款流程。

### 5.6 报名活动

`POST /activities/{activity_id}/registrations`

请求体：

```json
{
  "source": "activity_detail"
}
```

规则：

- 名额满时进入候补或返回 `63010`。
- 报名截止后返回 `63020`。
- 活动状态不允许报名返回 `63030`。

### 5.7 审核报名

`POST /activities/{activity_id}/registrations/{registration_id}/decision`

请求体：

```json
{
  "action": "approve"
}
```

可选值：

- `approve`
- `reject`

### 5.8 退出活动

`POST /activities/{activity_id}/registrations/{registration_id}/cancel`

规则：

- 用户主动退出和主办方移出都记录操作人。
- 若有候补，系统应触发候补转正。

### 5.9 我的活动

`GET /activities/mine`

查询参数：

- `role`：`host` / `participant`
- `status`

### 5.10 签到

`POST /activities/{activity_id}/check-in`

请求体：

```json
{
  "checkin_type": "self",
  "proof_data": {
    "lat": 31.22,
    "lng": 121.55
  }
}
```

## 6. 消息与通知

### 6.1 会话列表

`GET /conversations`

### 6.2 会话消息列表

`GET /conversations/{conversation_id}/messages`

### 6.3 发送消息

`POST /conversations/{conversation_id}/messages`

请求体：

```json
{
  "message_type": "text",
  "content": "我已经到球馆了"
}
```

规则：

- 禁止发送违法违规内容。
- 拉黑关系存在时禁止继续发送。

### 6.4 通知列表

`GET /notifications`

### 6.5 标记通知已读

`POST /notifications/read`

请求体：

```json
{
  "notification_ids": [1, 2, 3]
}
```

## 7. 举报、拉黑、信用

### 7.1 提交举报

`POST /reports`

请求体：

```json
{
  "target_type": "user",
  "target_id": 2,
  "reason_code": "harassment",
  "description": "活动结束后持续私聊骚扰",
  "evidence_urls": ["https://..."]
}
```

规则：

- 同一用户对同一对象的同类举报在未关闭前不可重复提交。

### 7.2 我的举报列表

`GET /reports/mine`

### 7.3 拉黑用户

`POST /blocks`

请求体：

```json
{
  "blocked_user_id": 2,
  "reason": "多次爽约"
}
```

### 7.4 信用记录

`GET /credit-records`

返回字段：

- `current_score`
- `records`

## 8. 会员与支付

### 8.1 会员套餐列表

`GET /memberships/plans`

### 8.2 创建会员订单

`POST /payment-orders`

请求体：

```json
{
  "biz_type": "membership",
  "biz_id": 1,
  "pay_channel": "wechat_pay"
}
```

### 8.3 查询订单

`GET /payment-orders/{order_no}`

### 8.4 当前会员信息

`GET /memberships/current`

## 9. 后台管理端接口

### 9.1 举报工单列表

`GET /admin/reports`

### 9.2 处理举报工单

`POST /admin/reports/{report_id}/decision`

请求体：

```json
{
  "action": "confirm",
  "result_action": "credit_deduct",
  "remark": "证据成立，扣减信用分 20"
}
```

### 9.3 创建官方活动

`POST /admin/activities`

### 9.4 用户审核或限权

`POST /admin/users/{user_id}/status`

## 10. 版本建议

### 10.1 MVP P0

必须优先实现：

- 鉴权与用户资料
- 发现与邀约
- 活动创建、详情、报名、取消、签到
- 通知
- 举报与拉黑

### 10.2 MVP P1

第二阶段实现：

- 会话与消息
- 会员与支付
- 后台治理接口

## 11. 结论

USport 的接口设计要点不是“接口数量少”，而是“协议稳定、状态明确、全端一致”。只要本规范被严格执行，小程序和移动端就能在统一契约上并行推进。
