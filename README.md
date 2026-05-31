# Voice Calendar 语音日历工具

Demo 演示视频：[Bilibili](https://www.bilibili.com/video/BV1ShVU6pEEu/?share_source=copy_web&vd_source=4e7307313c29024bdfe7842ec26e6e3d)

Voice Calendar 是一个以语音交互为核心的日历管理工具，面向“高频、轻量、跨设备”的日程管理场景。用户可以直接说出或输入自然语言需求，例如“十分钟后提醒我喝水”“明天下午两点在肯德基吃饭”“删除明天的会议”，系统会把需求解析为结构化日程，先弹出确认窗口，再由用户决定创建、删除或跳转查看。

本仓库是前端客户端，后端仓库见 [voice_calendar-server](https://github.com/nar-oah/voice_calendar-server)。

- 前端在线体验：https://calendar.naroah.top/
- 后端接口地址：https://aws.naroah.top/calendar
- 选题：语音版日历工具
- 开发周期：72 小时

## 题目理解

日历管理的真实需求通常不是“打开日历后逐项填写表单”，而是在会议、通勤、做饭、学习等场景里快速记录、快速查询、快速同步。因此本项目把语音和文本统一为“自然语言需求输入”，再结合确认弹窗、Token 同步、CalDAV 和 ICS 导出，尽量减少用户在日程创建和同步上的操作成本。

## 功能完整度

| 题目要求或用户需求 | 当前实现                                                                                            | 完成度         |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------- |
| 通过语音添加日程   | 浏览器 Web Speech API 识别中文语音，调用后端 `/parser` 解析，确认后调用 `/add` 创建                 | 已完成         |
| 通过文本添加日程   | 同一输入框支持手动输入或语音识别后继续编辑，适合不方便说话或需要修正识别结果的场景                  | 已完成         |
| 删除日程           | 后端解析删除意图并通过 PostgreSQL `pg_trgm` 模糊匹配候选日程，前端确认后调用 `/del`                 | 已完成         |
| 查看日程           | 后端解析查看意图，前端确认后通过 Schedule-X 控制器跳转到指定日期                                    | 已完成         |
| 到点提醒           | 创建日程后使用浏览器 Notification API 和 `setTimeout` 添加本页提醒                                  | 已完成         |
| 日程总览           | 右侧固定展示日历视图，支持当前时间线和事件弹窗                                                      | 已完成         |
| 跨设备同步         | 用户输入已有 Token 或获取新 Token，调用 `/events` 同步同一 Token 下的日程                           | 已完成         |
| CalDAV 同步        | 后端为 Token 创建 Radicale 用户和日历，创建/删除会同步到 CalDAV；前端展示 CalDAV 地址、用户名和密码 | 已完成         |
| ICS 导出           | 前端按当前选中日期调用 `/export`，下载 `voice_calendar.ics`                                         | 已完成         |
| 用户最终确认       | 所有解析出的操作都会进入确认弹窗，可修改标题、操作、时间、地点、备注后再提交                        | 已完成         |

当前版本已经覆盖题目要求中的添加、删除、查看、提醒等核心能力，并额外实现了 Token 持久化、CalDAV 同步和 ICS 导出。主要限制是：浏览器语音识别依赖 Chrome/Edge 等支持 `SpeechRecognition` 的浏览器；浏览器本页提醒需要页面保持运行。

## 创新点

1. **一页完成核心流程**  
   创建、管理和查看日程都是高频动作，因此界面不拆成多个页面。`src/routes/+page.svelte` 把语音/文本输入、Token 同步、导出入口和日历视图放在同一屏，降低来回跳转成本。

2. **右侧常驻日历视图**  
   `src/lib/calendar/Calendar.svelte` 使用 Schedule-X 展示日视图，用户创建或同步事件后能立即看到日程变化，也能通过“查看”意图跳转到对应日期。

3. **Token 即身份的轻量同步**  
   本项目没有引入传统注册、登录、找回密码流程。用户可以由系统生成 Token，也可以输入已有 Token；只要在不同设备上使用同一个 Token，就能同步同一批日程。Token 会保存在浏览器 `localStorage`，兼顾轻量使用和跨设备迁移。

4. **语音和文字混合输入**  
   语音识别结果会进入可编辑文本框，用户可以先说出大意，再手动补充地点、备注或修正识别错误。对嘈杂环境、隐私场景和长句需求更友好。

5. **轻量解析和大模型解析自动分流**  
   后端 `parser.py` 会先用 JioNLP、正则和自定义规则处理简单高频需求，例如“十分钟后提醒我喝水”；如果句子结构复杂或包含删除/查看等高风险意图，则切换到 Gemini 结构化输出。这样简单需求响应更快，复杂需求仍能保持较高解析能力。

6. **解析后不直接替用户执行**  
   语音日历的误操作成本很高，因此前端 `src/lib/confrim/ScheduleConfirm.svelte` 会把识别结果弹出给用户确认。用户可以在提交前修改操作类型、标题、开始/结束时间、地点和备注，最终决定权保留在用户手上。

7. **CalDAV 补足浏览器提醒限制**  
   浏览器通知要求页面存活，不适合作为唯一提醒方式。后端集成 Radicale/CalDAV，用户把前端展示的 CalDAV 地址、用户名、密码配置到系统日历后，之后的日程创建和删除都能同步到原生日历客户端，由系统级日历负责长期提醒。

8. **按日期导出 ICS**  
   对只想临时导入某一天日程的用户，项目提供 ICS 导出，不要求配置 CalDAV。前端会按当前日历选中日期下载标准 `text/calendar` 文件。

## 系统架构

```text
用户语音/文本
  -> Web Speech API / 文本框
  -> SvelteKit 单页界面
  -> POST /parser
      -> 简单需求：JioNLP + 正则规则
      -> 复杂需求：Gemini 结构化 JSON
  -> 确认弹窗
  -> POST /add 或 POST /del 或日历跳转
  -> PostgreSQL 持久化
  -> Radicale CalDAV 同步
  -> Schedule-X 日历展示 / 浏览器提醒 / ICS 导出
```

前端核心文件：

```text
src/routes/+page.svelte              # 页面编排：语音输入、同步面板、日历和确认弹窗
src/lib/speech-text/                 # 语音识别、文本输入、提交状态
src/lib/confrim/                     # 日程确认、编辑、格式化和提交动作
src/lib/calendar/Calendar.svelte     # Schedule-X 日历封装
src/lib/sync/                        # Token 同步、CalDAV 信息、导出入口
src/lib/api/                         # openapi-fetch 客户端和接口类型
```

后端核心文件在服务端仓库：

```text
main.py              # FastAPI 接口：token、events、parser、add、del、export
parser.py            # 高频简单需求的轻量语义解析
service.py           # Gemini 结构化解析
db.py                # PostgreSQL 持久化和模糊匹配
radicale.py          # Radicale/CalDAV 用户、日历、事件和 ICS 操作
models.py            # Pydantic 请求/响应模型
deploy/events.sql    # PostgreSQL 表结构、索引和 pg_trgm 配置
```

## 第三方依赖与原创功能说明

本项目没有使用现成的“语音日历完整产品”或整套业务模板。第三方库主要承担通用基础能力，例如 UI 框架、日历组件、接口类型、数据库连接、自然语言时间抽取、LLM 调用、CalDAV 协议和部署工具；具体的语音日历流程、Token 同步方案、确认交互、轻量/大模型解析分流、CalDAV 同步编排和 ICS 导出流程均为本项目原创实现。

### 前端运行依赖

| 依赖                            | 版本       | 用途                                         |
| ------------------------------- | ---------- | -------------------------------------------- |
| `@schedule-x/calendar`          | `^4.6.0`   | 日历核心能力                                 |
| `@schedule-x/calendar-controls` | `^4.6.0`   | 控制当前日期，用于查看指定日期和导出当前日期 |
| `@schedule-x/current-time`      | `^4.6.0`   | 日历中的当前时间线                           |
| `@schedule-x/event-modal`       | `^4.6.0`   | 日程详情弹窗                                 |
| `@schedule-x/events-service`    | `^4.6.0`   | 前端增删日历事件                             |
| `@schedule-x/svelte`            | `^3.0.0`   | Schedule-X 的 Svelte 组件封装                |
| `@schedule-x/theme-default`     | `^4.6.0`   | Schedule-X 默认样式                          |
| `@schedule-x/theme-shadcn`      | `^4.6.0`   | Schedule-X shadcn 风格主题                   |
| `openapi-fetch`                 | `^0.17.0`  | 基于 OpenAPI 类型调用后端接口                |
| `temporal-polyfill`             | `^0.3.2`   | 提供 Temporal 日期时间 API，统一上海时区转换 |
| `preact`                        | `^10.29.2` | 前端生态依赖，供相关组件兼容使用             |
| `@preact/signals`               | `^2.9.1`   | 前端生态依赖，供相关组件兼容使用             |

### 前端开发和构建依赖

| 依赖                            | 版本      | 用途                                          |
| ------------------------------- | --------- | --------------------------------------------- |
| `svelte`                        | `^5.55.2` | 前端组件框架                                  |
| `@sveltejs/kit`                 | `^2.57.0` | SvelteKit 应用框架                            |
| `@sveltejs/adapter-cloudflare`  | `^7.2.8`  | Cloudflare Pages 部署适配                     |
| `@sveltejs/vite-plugin-svelte`  | `^7.0.0`  | Vite 中编译 Svelte                            |
| `vite`                          | `^8.0.7`  | 前端开发服务器和构建工具                      |
| `typescript`                    | `^6.0.2`  | 类型系统                                      |
| `svelte-check`                  | `^4.4.6`  | Svelte/TypeScript 检查                        |
| `unocss`                        | `^66.7.0` | 原子化 CSS                                    |
| `@unocss/extractor-svelte`      | `^66.7.0` | UnoCSS 的 Svelte class 提取                   |
| `openapi-typescript`            | `^7.13.0` | 从后端 OpenAPI 生成 TypeScript 类型           |
| `wrangler`                      | `^4.81.0` | Cloudflare 类型生成、Pages 预览和部署相关工具 |
| `@types/dom-speech-recognition` | `^0.0.11` | Web Speech API 类型                           |
| `@types/node`                   | `^24`     | Node.js 类型                                  |
| `eslint`                        | `^10.2.0` | 代码检查                                      |
| `@eslint/compat`                | `^2.0.4`  | ESLint 兼容配置                               |
| `@eslint/js`                    | `^10.0.1` | ESLint JavaScript 推荐规则                    |
| `eslint-config-prettier`        | `^10.1.8` | 关闭与 Prettier 冲突的 ESLint 规则            |
| `eslint-plugin-svelte`          | `^3.17.0` | Svelte ESLint 规则                            |
| `typescript-eslint`             | `^8.58.1` | TypeScript ESLint 规则                        |
| `globals`                       | `^17.4.0` | ESLint 全局变量配置                           |
| `prettier`                      | `^3.8.1`  | 代码格式化                                    |
| `prettier-plugin-svelte`        | `^3.5.1`  | Svelte 文件格式化                             |

### 后端依赖

| 依赖              | 用途                                                    |
| ----------------- | ------------------------------------------------------- |
| `fastapi`         | 后端 HTTP API 框架                                      |
| `uvicorn`         | ASGI 服务运行器                                         |
| `google-genai`    | 调用 Gemini，生成符合 Pydantic schema 的结构化日程 JSON |
| `pydantic`        | 请求/响应模型、时间范围校验、结构化输出校验             |
| `jionlp`          | 中文自然语言时间抽取，用于简单高频需求的快速解析        |
| `psycopg[binary]` | PostgreSQL 数据库连接                                   |
| `bcrypt`          | 生成 Radicale 用户密码哈希                              |
| `caldav`          | 操作 CalDAV 服务中的日历和事件                          |
| `icalendar`       | 生成和解析 ICS/iCalendar 数据                           |

后端还依赖 PostgreSQL 的 `pg_trgm` 扩展做日程标题、地点和备注的模糊匹配；部署侧使用 Radicale 提供 CalDAV 服务，使用 systemd 管理 FastAPI 服务。

### 浏览器和平台能力

| 能力                                                           | 是否第三方     | 用途                         |
| -------------------------------------------------------------- | -------------- | ---------------------------- |
| Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) | 否，浏览器 API | 中文语音识别                 |
| Notification API                                               | 否，浏览器 API | 页面存活时的到点提醒         |
| Clipboard API                                                  | 否，浏览器 API | 一键复制 CalDAV 地址和 Token |
| `localStorage`                                                 | 否，浏览器 API | 保存用户 Token               |
| Cloudflare Pages                                               | 平台能力       | 前端部署                     |

## 原创实现范围

原创前端实现包括：

- 单页工作台布局和各区域交互编排；
- 语音识别状态管理、连续识别结果拼接、语音和文本混合输入；
- 自然语言解析结果确认弹窗，以及可编辑字段、操作分流和提交逻辑；
- Token 获取、保存、同步、CalDAV 信息展示和复制；
- Schedule-X 日历事件映射、日期跳转、同步后批量展示；
- ICS 文件下载流程和本页浏览器提醒流程。

原创后端实现包括：

- FastAPI 接口设计和前后端 OpenAPI 类型契约；
- Token 维度的日程持久化模型；
- 高频简单语句的本地规则解析器；
- 简单解析失败后切换 Gemini 的结构化解析策略；
- 删除/查看场景下基于时间范围和文本相似度的候选日程匹配；
- Radicale 用户创建、CalDAV 日历创建、事件同步和按日期导出 ICS 的编排逻辑。

第三方库没有替代以上业务流程，只提供通用能力。评审时可重点查看 `src/routes/+page.svelte`、`src/lib/speech-text/SpeechText.svelte`、`src/lib/confrim/ScheduleConfirm.svelte`、服务端 `parser.py`、`main.py`、`db.py` 和 `radicale.py`。

## 接口概览

前端通过 `src/lib/api/client.ts` 调用后端，当前基础地址为：

```ts
baseUrl: 'https://aws.naroah.top/calendar';
```

| 接口                              | 用途                                               |
| --------------------------------- | -------------------------------------------------- |
| `GET /token`                      | 生成新的同步 Token                                 |
| `POST /events?token=...`          | 读取该 Token 下全部日程                            |
| `POST /parser?token=...&text=...` | 把自然语言解析为 `create`、`delete` 或 `read` 操作 |
| `POST /add?token=...`             | 创建日程并同步到 CalDAV                            |
| `POST /del?token=...&id=...`      | 删除日程并同步到 CalDAV                            |
| `POST /export?token=...&date=...` | 导出指定日期的 ICS 文件                            |

## 本地开发

环境要求：

- Node.js
- pnpm
- 支持 `SpeechRecognition` 的浏览器，例如 Chrome 或 Edge

安装依赖：

```sh
pnpm install
```

启动前端开发服务器：

```sh
pnpm dev
```

常用脚本：

```sh
pnpm check     # 生成 Cloudflare 类型并运行 Svelte/TypeScript 检查
pnpm lint      # Prettier 检查和 ESLint
pnpm format    # 格式化项目
pnpm build     # 生产构建
pnpm preview   # Wrangler 预览 Cloudflare Pages 输出
pnpm gen       # 重新生成 Wrangler 类型
```

后端本地运行请参考服务端仓库，核心步骤是安装 `requirements.txt`、配置 `GEMINI_API_KEY`、准备 PostgreSQL 表结构和 Radicale 服务，然后运行 `uvicorn main:app --reload`。

## 部署说明

前端使用 `@sveltejs/adapter-cloudflare`，Wrangler 配置位于 `wrangler.jsonc`，Cloudflare Pages 构建输出目录为 `.svelte-kit/cloudflare`。

生产构建：

```sh
pnpm build
```

本地预览 Cloudflare Pages 输出：

```sh
pnpm preview
```

后端仓库包含 `deploy/events.sql` 和 `deploy/voice_calendar.service`，分别用于 PostgreSQL 初始化和 systemd 服务部署。
