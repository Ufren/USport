# 系统架构文档

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                               │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  微信小程序   │  React Native │   Web管理后台  │    H5移动端      │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │            │               │
       └─────────────┴────────────┴───────────────┘
                           │
                    ┌──────▼──────┐
                    │   API Gateway │
                    │   (Nginx)    │
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│   用户服务   │    │   场馆服务   │    │   活动服务   │
│   (Go/Gin)  │    │   (Go/Gin)  │    │   (Go/Gin)  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │    MySQL     │          │    Redis     │
       │   (主库)     │          │   (缓存)      │
       └─────────────┘          └──────────────┘
```

## 2. 技术栈

### 后端

- 语言: Go 1.21+
- 框架: Gin
- ORM: Gorm
- 缓存: Redis
- 数据库: MySQL 8.0+

### 前端

- 微信小程序: WXML + WXSS + TypeScript
- 移动端: React Native + TypeScript
- 状态管理: Zustand (RN) / 小程序内置Store

### 基础设施

- Monorepo: Turborepo + pnpm
- CI/CD: GitHub Actions
- 容器化: Docker

## 3. 项目结构

```
usport/
├── apps/                    # 前端应用
│   ├── mini-program/       # 微信小程序
│   └── mobile/             # React Native
├── services/               # 后端服务
│   └── api/                # Go API 服务
├── packages/               # 共享包
│   └── shared/             # 共享类型和工具
├── configs/                # 配置文件
│   └── eslint/             # ESLint 配置
├── docs/                   # 文档
└── scripts/                # 构建脚本
```

## 4. API 设计

### 认证

- POST /api/v1/users/register - 用户注册
- POST /api/v1/users/login - 用户登录

### 用户

- GET /api/v1/users/:id - 获取用户信息
- PUT /api/v1/users/profile - 更新个人资料

### 场馆

- GET /api/v1/venues - 获取场馆列表
- GET /api/v1/venues/:id - 获取场馆详情
- POST /api/v1/venues/:id/book - 预约场馆

### 活动

- GET /api/v1/activities - 获取活动列表
- POST /api/v1/activities - 创建活动
- POST /api/v1/activities/:id/join - 参加活动
