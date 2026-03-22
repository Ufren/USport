# USport UI Token 与前端实现规范

文档版本：V1.0  
更新时间：2026-03-22  
适用范围：小程序端、移动端、后台 Web、共享前端包

## 1. 文档定位

本文档把 `USport-DESIGN.md` 的设计语言继续下沉为可实现的前端规范，目标是：

- 设计资产可被工程稳定复用
- 小程序端、移动端、后台端共享同一套语义 token
- 组件外观、交互反馈、状态表达保持一致
- 后续落 Figma、代码实现、视觉验收时不再重复讨论基础样式

原则：

- 先定义语义，再定义具体色值和尺寸。
- 共享枚举和业务状态，端内适配渲染，不重复发明 token。
- UI token 是品牌与体验约束，不是随手写样式的参考建议。

## 2. 设计方向摘要

USport 当前视觉方向为：

- 气质：Urban Court Energy
- 场景：同城运动成局、真实场馆、轻社交、强履约
- 关键词：真实、干净、敏捷、克制、有运动张力

因此前端表达上需要避免：

- 过度互联网金融感
- 过强社交聊天产品感
- 泛紫色 AI 模板风格
- 高饱和霓虹堆叠和过量玻璃拟态

## 3. Token 组织建议

建议后续在 monorepo 中形成独立共享包：

```text
packages/
  shared/
    src/
      constants/
      types/
  tokens/
    src/
      color.ts
      spacing.ts
      radius.ts
      motion.ts
      shadow.ts
      typography.ts
      semantic.ts
      index.ts
```

原则：

- `packages/shared` 负责业务枚举、状态常量、页面 code。
- `packages/tokens` 负责视觉 token，不放业务逻辑。
- 小程序和移动端仅做平台适配，不复制 token 定义。

## 4. 基础 Token

### 4.1 Color Token

#### 4.1.1 Brand

| Token | 值 | 用途 |
| --- | --- | --- |
| `color-brand-primary` | `#156B52` | 主品牌色，主按钮、关键 CTA |
| `color-brand-primary-hover` | `#0F5A45` | Hover / Pressed |
| `color-brand-secondary` | `#B6F36A` | 强调色，筛选选中、成长感提示 |
| `color-brand-accent` | `#FF7A1A` | 成局、热度、重点提示 |

#### 4.1.2 Neutral

| Token | 值 |
| --- | --- |
| `color-neutral-0` | `#FFFFFF` |
| `color-neutral-50` | `#F7F8F6` |
| `color-neutral-100` | `#EEF1ED` |
| `color-neutral-200` | `#DCE2DD` |
| `color-neutral-300` | `#B8C1BB` |
| `color-neutral-500` | `#66726C` |
| `color-neutral-700` | `#2D3631` |
| `color-neutral-900` | `#131714` |

#### 4.1.3 Semantic

| Token | 值 | 用途 |
| --- | --- | --- |
| `color-success` | `#1F9D61` | 成功、已通过、已签到 |
| `color-warning` | `#E6A019` | 截止提醒、候补、注意 |
| `color-danger` | `#D64545` | 风险、举报、封禁、错误 |
| `color-info` | `#2F7EF7` | 系统通知、信息提示 |

#### 4.1.4 Surface

| Token | 值 | 用途 |
| --- | --- | --- |
| `color-surface-page` | `#F4F7F2` | 页面底色 |
| `color-surface-card` | `#FFFFFF` | 卡片底色 |
| `color-surface-muted` | `#EDF3EA` | 轻背景分组块 |
| `color-surface-inverse` | `#18201B` | 深色反白区域 |

### 4.2 Typography Token

字体延续 `USport-DESIGN.md` 的策略，工程侧建议采用：

- 展示标题：`"General Sans", "Noto Sans SC", sans-serif`
- 正文与界面：`"Plus Jakarta Sans", "Noto Sans SC", sans-serif`
- 数字与数据：`"IBM Plex Sans", "Noto Sans SC", sans-serif`

字阶建议：

| Token | 值 |
| --- | --- |
| `font-size-hero` | `32px` |
| `font-size-h1` | `28px` |
| `font-size-h2` | `24px` |
| `font-size-h3` | `20px` |
| `font-size-title` | `18px` |
| `font-size-body` | `16px` |
| `font-size-body-sm` | `14px` |
| `font-size-caption` | `12px` |

字重建议：

| Token | 值 |
| --- | --- |
| `font-weight-regular` | `400` |
| `font-weight-medium` | `500` |
| `font-weight-semibold` | `600` |
| `font-weight-bold` | `700` |

行高建议：

| Token | 值 |
| --- | --- |
| `line-height-tight` | `1.2` |
| `line-height-normal` | `1.5` |
| `line-height-relaxed` | `1.7` |

### 4.3 Spacing Token

采用 4px 基础栅格：

| Token | 值 |
| --- | --- |
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `20px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |

### 4.4 Radius Token

| Token | 值 | 用途 |
| --- | --- | --- |
| `radius-xs` | `6px` | 输入框、小标签 |
| `radius-sm` | `10px` | 小卡片 |
| `radius-md` | `14px` | 常规卡片、弹窗 |
| `radius-lg` | `20px` | Hero 模块、大容器 |
| `radius-pill` | `999px` | 胶囊按钮、筛选标签 |

### 4.5 Shadow Token

| Token | 值 |
| --- | --- |
| `shadow-sm` | `0 4px 10px rgba(19, 23, 20, 0.06)` |
| `shadow-md` | `0 10px 24px rgba(19, 23, 20, 0.10)` |
| `shadow-lg` | `0 18px 40px rgba(19, 23, 20, 0.14)` |

### 4.6 Motion Token

| Token | 值 |
| --- | --- |
| `motion-duration-fast` | `120ms` |
| `motion-duration-base` | `180ms` |
| `motion-duration-slow` | `280ms` |
| `motion-ease-enter` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `motion-ease-emphasis` | `cubic-bezier(0.22, 1, 0.36, 1)` |

## 5. 语义 Token

### 5.1 文本语义

| Token | 对应值 | 用途 |
| --- | --- | --- |
| `text-primary` | `color-neutral-900` | 主标题、主内容 |
| `text-secondary` | `color-neutral-700` | 次级正文 |
| `text-tertiary` | `color-neutral-500` | 辅助说明 |
| `text-inverse` | `color-neutral-0` | 深色背景文字 |
| `text-link` | `color-info` | 文本链接 |

### 5.2 背景语义

| Token | 对应值 |
| --- | --- |
| `bg-page` | `color-surface-page` |
| `bg-card` | `color-surface-card` |
| `bg-muted` | `color-surface-muted` |
| `bg-brand` | `color-brand-primary` |
| `bg-accent` | `color-brand-accent` |
| `bg-danger-soft` | `#FDEDED` |
| `bg-warning-soft` | `#FFF4D8` |
| `bg-success-soft` | `#E8F7EF` |

### 5.3 边框语义

| Token | 对应值 |
| --- | --- |
| `border-default` | `color-neutral-200` |
| `border-strong` | `color-neutral-300` |
| `border-brand` | `color-brand-primary` |
| `border-danger` | `color-danger` |

## 6. 业务状态与视觉映射

### 6.1 活动状态映射

| 业务状态 | 标签底色 | 标签文字色 | CTA 策略 |
| --- | --- | --- | --- |
| `published` | `bg-success-soft` | `color-success` | 主按钮可点 |
| `full` | `bg-warning-soft` | `color-warning` | 候补按钮或禁用 |
| `signup_closed` | `color-neutral-100` | `color-neutral-700` | 置灰禁用 |
| `ongoing` | `bg-brand` | `text-inverse` | 查看详情 |
| `completed` | `color-neutral-100` | `color-neutral-700` | 查看结果 |
| `cancelled` | `bg-danger-soft` | `color-danger` | 禁用并说明原因 |

### 6.2 报名状态映射

| 业务状态 | 推荐文案 | 色彩策略 |
| --- | --- | --- |
| `pending_review` | 审核中 | warning |
| `approved` | 已报名 | success |
| `waitlisted` | 候补中 | warning |
| `rejected` | 未通过 | danger |
| `checked_in` | 已签到 | success |
| `no_show` | 未到场 | danger |
| `completed` | 已完成 | neutral |

### 6.3 用户风险状态映射

| 业务状态 | 组件表现 |
| --- | --- |
| `normal` | 正常展示 |
| `restricted` | 黄底提醒 + 禁止发起关键操作 |
| `banned` | 红底提醒 + 关闭功能入口 |

## 7. 组件实现规范

### 7.1 Button

按钮分为：

- `primary`
- `secondary`
- `ghost`
- `danger`

规范：

- 主按钮默认使用 `color-brand-primary`。
- 次按钮使用描边或浅底，不与主按钮抢层级。
- `danger` 仅用于取消活动、拉黑、举报提交、封禁等高风险动作。
- 小程序端和移动端都不应出现渐变主按钮。

尺寸建议：

| 尺寸 | 高度 | 字号 |
| --- | --- | --- |
| `sm` | `32px` | `14px` |
| `md` | `40px` | `14px` |
| `lg` | `48px` | `16px` |

### 7.2 Card

卡片类型：

- 活动卡
- 搭子卡
- 统计卡
- 信息卡

规范：

- 默认白底 + 中等圆角 + 轻阴影。
- 活动 Hero 卡允许使用品牌渐层，但只用于关键推荐区。
- 卡片内元素遵循 `标题 -> 关键元信息 -> 辅助信息 -> CTA` 的信息层级。

### 7.3 Tag / Chip

标签类型：

- 运动类型标签
- 状态标签
- 门槛标签
- 风险标签

规范：

- 状态标签优先使用软底色，不使用过度饱和实底。
- 筛选 chip 选中态可使用 `color-brand-secondary`。
- 风险标签必须使用 warning/danger 语义，不借用品牌主色。

### 7.4 Form

规范：

- 输入框高度建议 `44px` 到 `48px`。
- 错误提示紧贴字段，不只在 toast 提示。
- 必填项优先通过字段说明表达，不建议大量红星污染页面。
- 时间、地点、费用等关键字段的联动校验要实时反馈。

### 7.5 Navigation

#### 小程序 Tab Bar

- 仅保留 3 到 4 个一级入口。
- 图标建议实心 + 线性混合风格，避免纯装饰化。
- 选中态使用品牌主色，未选中使用中性灰。

#### 移动端底部导航

- 发现
- 消息
- 我的

如未来加入“活动”独立一级页，需先验证是否提高转化，否则不建议膨胀。

#### 后台侧边栏

- 一级导航左对齐
- 当前选中项使用浅品牌底 + 深色文字
- 后台不使用过多运动装饰元素，保持工具属性

### 7.6 Empty / Error / Skeleton

空态规范：

- 必须说明为什么为空
- 必须给出下一步动作
- 图形语言保持轻量，不使用卡通插画

错误态规范：

- 网络错误、权限错误、状态冲突错误要有不同文案
- 状态冲突错误要引用业务状态原因，如“活动已满员”

骨架屏规范：

- 首页列表、详情页首屏、消息列表建议提供骨架屏
- 骨架屏使用 `color-neutral-100/200`，避免高对比闪烁

## 8. 多端适配规范

### 8.1 小程序端

- 优先考虑高频、短路径、轻输入。
- 单屏信息密度略高于移动端，但 CTA 更明确。
- 使用 `rpx` 或 Taro/Uno 等适配方案时，token 源仍保持 px 基准，在构建层换算。

### 8.2 React Native 移动端

- 留白比小程序更充足，承接更深关系和更长停留时长。
- 允许更细腻的动效和卡片过渡。
- 深层页面如搭子详情、消息、会员页应更注重沉浸和连续滚动体验。

### 8.3 后台 Web

- 优先效率、清晰度、数据密度。
- 字号和间距相比 C 端更收敛。
- 风险、举报、状态、表格字段须优先可读性，不追求运动感装饰。

## 9. 工程实现建议

### 9.1 Token 命名规范

TypeScript 导出建议：

```ts
export const colors = {
  brandPrimary: "#156B52",
  brandSecondary: "#B6F36A",
};
```

CSS 变量建议：

```css
:root {
  --color-brand-primary: #156b52;
  --space-4: 16px;
  --radius-md: 14px;
}
```

原则：

- TS 使用 camelCase
- CSS 变量使用 kebab-case
- 不直接以页面名定义 token，如 `homeGreen`
- 优先语义命名，如 `textPrimary` 而不是 `black900`

### 9.2 主题分层

建议分为：

1. `primitive tokens`
2. `semantic tokens`
3. `component tokens`
4. `screen overrides`

禁止直接在页面里写死品牌色值替代 component token。

### 9.3 共享包消费方式

- 小程序：通过样式变量或 JS 常量映射消费
- RN：通过主题对象注入组件库或样式层
- Web 后台：通过 CSS Variables + design tokens 生成器消费

## 10. 与业务规格的衔接要求

- 页面编码统一复用 [USport-IA-Page-Spec.md](/D:/Ufren-workspace/USport/docs/prd/USport-IA-Page-Spec.md) 中的 page code。
- 字段、状态、按钮文案应对齐 [USport-Field-Level-Interaction-Spec.md](/D:/Ufren-workspace/USport/docs/design/USport-Field-Level-Interaction-Spec.md)。
- 活动、报名、邀约、用户治理状态映射必须对齐 [USport-State-Machine-Source.md](/D:/Ufren-workspace/USport/docs/prd/USport-State-Machine-Source.md)。

## 11. 验收清单

设计与前端联调时至少检查：

1. 同一状态在多端的颜色和文案是否一致
2. 主次按钮层级是否稳定
3. 空态、错误态、禁用态是否都有明确说明
4. 卡片圆角、阴影、间距是否遵循 token
5. 列表、详情、弹窗的标题层级是否统一
6. 后台是否过度沿用 C 端视觉语言

## 12. 结论

这份规范的价值不在于“定义几个颜色”，而在于把 USport 的品牌、业务状态和多端前端实现真正打通。后续只要 token、状态、字段三套真源保持一致，USport 的小程序、移动端和后台就能在同一视觉与工程体系下稳定演进。
