# USport

A monorepo project for USport platform, built with modern technologies.

## Tech Stack

- **Backend**: Golang + Gin + GORM Gen + Redis
- **Mini Program**: WeChat Mini Program (WXML + WXSS + TypeScript)
- **Mobile**: React Native + TypeScript
- **Monorepo Tool**: Turborepo + pnpm

## Project Structure

```
usport/
├── apps/                    # 前端应用
│   ├── mini-program/       # 微信小程序
│   └── mobile/             # 移动端 (React Native)
├── services/               # 后端服务
│   └── api/                # Go Web 服务
│       ├── cmd/            # 入口命令
│       │   ├── server/     # 服务启动入口
│       │   └── generate/   # GORM Gen 代码生成
│       ├── dal/            # 数据访问层 (自动生成)
│       │   ├── model/      # 数据模型
│       │   └── query/      # 查询接口
│       ├── internal/       # 内部包
│       │   ├── config/     # 配置管理
│       │   ├── handler/    # 处理器
│       │   ├── middleware/ # 中间件
│       │   └── service/    # 业务逻辑
│       ├── pkg/            # 公共包
│       │   ├── database/  # MySQL 封装
│       │   ├── redis/     # Redis 封装
│       │   ├── logger/    # 日志封装
│       │   ├── response/  # 响应封装
│       │   └── wechat/    # 微信服务封装
│       ├── scripts/        # 脚本
│       │   └── init.sql   # 数据库初始化脚本
│       └── config.yml      # 配置文件
├── packages/               # 共享包
│   └── shared/             # 共享类型和工具
├── configs/                # 配置文件
│   └── eslint/             # ESLint 配置
├── docs/                   # 文档
│   └── prd/                # 产品需求文档
└── scripts/                # 构建脚本
```

## Backend Development

### Configuration

All configurations are managed via `config.yml`:

```yaml
server:
  host: "0.0.0.0"
  port: 8080

db:
  host: "localhost"
  port: 3306
  user: "root"
  password: "password"
  name: "usport"

redis:
  host: "localhost"
  port: 6379

jwt:
  secret: "your-secret-key"
  expire: 86400

wechat:
  appid: "your-wechat-appid"
  secret: "your-wechat-secret"

log:
  level: "debug"
  encoding: "json"
```

### Database Setup

1. Initialize the database:

```bash
cd services/api
mysql -u root -p < scripts/init.sql
```

2. Generate code with GORM Gen:

```bash
cd services/api
go run cmd/generate/main.go
```

### Code Generation

Edit `cmd/generate/main.go` to configure tables and custom fields:

```go
var tableConfigs = []TableConfig{
    {
        TableName: "users",
        ModelName: "User",
        ExtraFields: []FieldConfig{
            {FieldName: "Openid", FieldType: "string", Tag: `json:"openid" gorm:"uniqueIndex;size:100"`},
        },
    },
    // Add more tables here...
}
```

- `TableName`: Database table name
- `ModelName`: Generated model name
- `ExtraFields`: Custom fields not in table structure (use `gorm:"-"` to exclude from DB operations)

### Backend Commands

```bash
cd services/api

make help        # Show all available commands
make dev         # Run in development mode
make build       # Build the application
make run         # Build and run
make test        # Run tests
make lint        # Run linter
make generate    # Generate models and queries with GORM Gen
make init-db     # Initialize database
```

## Authentication

The backend implements **Login-as-Registration** mechanism - users don't need to register separately. Just login with WeChat and a user account will be automatically created if it doesn't exist.

### 1. Wechat Login (Recommended)

```http
POST /api/v1/users/wechat_login?code=xxxxx
```

**Flow:**

1. Frontend (Mini Program) calls `wx.login()` to get the code
2. Pass the code to backend
3. Backend validates with WeChat and creates user if not exists
4. Returns JWT token

**Response:**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "openid": "oxxxxxxxx",
      "unionid": "uxxxxxxxx",
      "status": 1
    },
    "is_new_user": true
  }
}
```

- `is_new_user: true` - indicates this is a newly registered user
- `is_new_user: false` - existing user login

### 2. Phone Number Login

```http
POST /api/v1/users/phone_login
Content-Type: application/json

{
    "code": "xxxxx"
}
```

- Frontend should use WeChat's `getPhoneNumber` to get the code
- Automatically binds phone number to user account

## API Endpoints

| Method | Endpoint                   | Description                          | Auth |
| ------ | -------------------------- | ------------------------------------ | ---- |
| GET    | /api/v1/health             | Health check                         | No   |
| POST   | /api/v1/users/wechat_login | WeChat login (login-as-registration) | No   |
| POST   | /api/v1/users/phone_login  | Phone number login                   | No   |
| GET    | /api/v1/users/:id          | Get user info                        | Yes  |

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Go >= 1.21
- MySQL >= 8.0
- Redis >= 6.0

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Start specific app
pnpm --filter mini-program dev
pnpm --filter mobile dev

# Start backend (in services/api directory)
make dev
```

### Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests
- `pnpm clean` - Clean all build outputs

## License

MIT
