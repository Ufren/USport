# 数据库设计文档

## 1. 用户表 (users)

| 字段       | 类型         | 说明          |
| ---------- | ------------ | ------------- |
| id         | BIGINT PK    | 用户ID        |
| username   | VARCHAR(50)  | 用户名 (唯一) |
| password   | VARCHAR(255) | 密码 (加密)   |
| email      | VARCHAR(100) | 邮箱 (唯一)   |
| phone      | VARCHAR(20)  | 手机号        |
| nickname   | VARCHAR(50)  | 昵称          |
| avatar     | VARCHAR(255) | 头像URL       |
| status     | TINYINT      | 状态 (1=正常) |
| created_at | TIMESTAMP    | 创建时间      |
| updated_at | TIMESTAMP    | 更新时间      |

## 2. 场馆表 (venues)

| 字段        | 类型         | 说明     |
| ----------- | ------------ | -------- |
| id          | BIGINT PK    | 场馆ID   |
| name        | VARCHAR(100) | 场馆名称 |
| address     | VARCHAR(255) | 地址     |
| image       | VARCHAR(255) | 图片URL  |
| description | TEXT         | 描述     |
| status      | TINYINT      | 状态     |
| created_at  | TIMESTAMP    | 创建时间 |
| updated_at  | TIMESTAMP    | 更新时间 |

## 3. 活动表 (activities)

| 字段        | 类型         | 说明     |
| ----------- | ------------ | -------- |
| id          | BIGINT PK    | 活动ID   |
| title       | VARCHAR(100) | 活动标题 |
| description | TEXT         | 描述     |
| time        | DATETIME     | 活动时间 |
| venue_id    | BIGINT FK    | 场馆ID   |
| status      | TINYINT      | 状态     |
| created_at  | TIMESTAMP    | 创建时间 |
| updated_at  | TIMESTAMP    | 更新时间 |

## 4. 预约表 (bookings)

| 字段       | 类型      | 说明     |
| ---------- | --------- | -------- |
| id         | BIGINT PK | 预约ID   |
| user_id    | BIGINT FK | 用户ID   |
| venue_id   | BIGINT FK | 场馆ID   |
| book_time  | DATETIME  | 预约时间 |
| status     | TINYINT   | 状态     |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
