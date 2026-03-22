# USport 文档索引

更新时间：2026-03-22

## 1. 文档地图

| 文档 | 作用 | 主要使用角色 |
| --- | --- | --- |
| `USport-Smatch-DeepResearch-PRD.md` | 市场研究、竞品分析、产品定位 | 创始人、产品、运营 |
| `USport-详细需求说明书-SRS.md` | 详细业务需求、场景规则、验收口径 | 产品、研发、测试、运营 |
| `USport-Gstack-需求评审与优化.md` | 基于 gstack 的产品与工程复盘、校正版建议 | 产品负责人、研发负责人、创始人 |
| `USport-Architecture-Spec.md` | 技术架构、端职责、工程边界 | 架构、前后端、测试 |
| `USport-Database-Spec.md` | 数据模型、状态、索引、迁移方向 | 后端、DBA、测试 |
| `USport-API-Spec.md` | 接口协议、字段、错误码、鉴权规范 | 前后端、测试 |
| `USport-State-Machine-Source.md` | 活动、报名、邀约、举报、支付等唯一状态真源 | 前后端、测试、运营 |
| `USport-Analytics-Metrics-Dictionary.md` | 埋点事件、北极星指标、经营口径、看板定义 | 产品、增长、数据、研发 |
| `USport-IA-Page-Spec.md` | 信息架构、页面清单、交互入口出口 | 产品、设计、前端、测试 |
| `USport-Delivery-Plan.md` | 版本范围、排期、里程碑、职责分工 | 产品、研发负责人、项目管理 |
| `USport-Test-Acceptance.md` | 测试策略、验收清单、发布前检查 | 测试、研发、产品 |

## 2. 推荐阅读顺序

建议按以下顺序阅读：

1. `USport-Smatch-DeepResearch-PRD.md`
2. `USport-详细需求说明书-SRS.md`
3. `USport-Gstack-需求评审与优化.md`
4. `USport-State-Machine-Source.md`
5. `USport-IA-Page-Spec.md`
6. `USport-API-Spec.md`
7. `USport-Database-Spec.md`
8. `USport-Analytics-Metrics-Dictionary.md`
9. `USport-Architecture-Spec.md`
10. `USport-Delivery-Plan.md`
11. `USport-Test-Acceptance.md`

## 3. 使用建议

### 3.1 立项与方向确认

重点查看：

- `USport-Smatch-DeepResearch-PRD.md`
- `USport-详细需求说明书-SRS.md`

### 3.2 研发启动

重点查看：

- `USport-IA-Page-Spec.md`
- `USport-API-Spec.md`
- `USport-Database-Spec.md`
- `USport-State-Machine-Source.md`
- `USport-Analytics-Metrics-Dictionary.md`
- `USport-Architecture-Spec.md`

### 3.3 测试与上线

重点查看：

- `USport-详细需求说明书-SRS.md`
- `USport-Test-Acceptance.md`
- `USport-Delivery-Plan.md`

## 4. 当前状态说明

当前文档体系已经从“产品方向文档”扩展到“可执行研发文档”，可以支持：

- 前后端并行开发
- 页面与接口联调
- 数据库建模与状态机实现
- 埋点实施与经营看板对齐
- 测试用例拆解
- MVP 排期和里程碑管理

仍建议后续继续补充两类文档：

- 后端接口示例数据与联调 Mock
- SQL migration 与 OpenAPI 草案
