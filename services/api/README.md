# USport API

USport 后端服务采用 `Go + Gin + GORM + MySQL + Redis` 的分层架构，当前已经提供用户登录、活动发现、活动详情、发起活动、报名与我的活动等基础能力。

## 目录结构

- `cmd/server`：服务启动入口
- `internal/server`：路由注册与 HTTP 入口编排
- `internal/handler`：请求解析与响应封装
- `internal/service`：业务编排层
- `internal/repository`：数据访问层
- `internal/assembler`：DTO 组装与展示转换
- `internal/dto`：请求与响应协议对象
- `scripts`：数据库初始化、构建与部署脚本

## 本地运行

1. 复制配置模板：
   - `config.example.yml -> config.yml`
   - `.env.example -> .env`
2. 按实际环境填写 MySQL、Redis、JWT、微信配置。
3. 初始化数据库：

```bash
mysql -u root -p < scripts/init.sql
```

4. 启动服务：

```bash
go run ./cmd/server
```

健康检查接口：

```text
GET /api/v1/health
```

该接口会返回服务状态以及构建元信息，便于部署后核验版本。

## 构建发布

### Linux/macOS

```bash
VERSION=v0.1.0 TARGET_OS=linux TARGET_ARCH=amd64 ./scripts/build.sh
```

### Windows PowerShell

```powershell
$env:VERSION = "v0.1.0"
$env:TARGET_OS = "windows"
$env:TARGET_ARCH = "amd64"
.\scripts\build.ps1
```

构建产物会输出到：

- `bin/`：原始二进制
- `release/`：可部署压缩包

## 无 Docker Compose 部署

### Linux 服务器自动部署

```bash
export DEPLOY_HOST=your-server
export DEPLOY_USER=root
export DEPLOY_DIR=/opt/usport-api
export SERVICE_NAME=usport-api
export VERSION=v0.1.0
./scripts/deploy.sh
```

### Windows PowerShell 自动部署

```powershell
$env:DEPLOY_HOST = "your-server"
$env:DEPLOY_USER = "root"
$env:DEPLOY_DIR = "/opt/usport-api"
$env:SERVICE_NAME = "usport-api"
$env:VERSION = "v0.1.0"
.\scripts\deploy.ps1
```

部署脚本会自动完成：

- 本地构建打包
- 上传压缩包到服务器
- 解压到目标目录
- 安装 `systemd` 服务
- 重载并重启服务

## 工程约定

- 统一通过 `pkg/response` 返回 `code/message/data` 协议
- Handler 不直接写 SQL
- Service 不直接依赖 Gin
- Repository 只负责数据读写，不承载页面展示文案
- 复杂展示字段统一在 Assembler 中转换
