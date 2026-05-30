# Voice Calendar Client

语音日程客户端。应用使用浏览器语音识别把中文语音或文本转成结构化日程，确认后把日程添加到当天日历视图中。

## 功能

- 使用 Web Speech API 进行中文语音输入，识别语言为 `zh-CN`。
- 支持手动编辑识别文本，再提交给后端解析。
- 调用后端 `POST /event?text=...`，把自然语言解析为日程事件。
- 在确认弹窗中查看或修改标题、时间、地点、备注和操作类型。
- 确认创建后将事件添加到 Schedule-X 日历。

说明：后端 schema 支持 `create`、`delete`、`update` 三种操作；当前页面已完成创建事件接入，删除和更新回调仍是占位逻辑。

## 技术栈

- SvelteKit 2 / Svelte 5
- TypeScript
- UnoCSS
- Schedule-X
- openapi-fetch / openapi-typescript
- Cloudflare Pages adapter / Wrangler

## 环境要求

- Node.js
- pnpm
- 支持 `SpeechRecognition` 的浏览器，例如 Chrome 或 Edge

语音识别通常需要在 `localhost` 或 HTTPS 页面中运行。后端地址目前写在 `src/lib/api/client.ts`：

```ts
baseUrl: 'https://aws.naroah.top/calendar';
```

## 本地开发

安装依赖：

```sh
pnpm install
```

启动开发服务器：

```sh
pnpm dev
```

打开浏览器访问 Vite 输出的本地地址。

## 常用脚本

```sh
pnpm dev
```

启动本地开发服务器。

```sh
pnpm check
```

生成 Cloudflare 类型并运行 Svelte/TypeScript 检查。

```sh
pnpm lint
```

运行 Prettier 检查和 ESLint。

```sh
pnpm format
```

格式化项目文件。

```sh
pnpm build
```

生成 Cloudflare 类型并构建生产版本。

```sh
pnpm preview
```

使用 Wrangler 预览 Cloudflare Pages 构建产物。

```sh
pnpm gen
```

重新生成 Wrangler 类型。

## 目录结构

```text
src/
  lib/
    api/             # openapi-fetch 客户端和生成的 API 类型
    calendar/        # Schedule-X 日历组件
    speech-text/     # 语音输入、文本框和控制区组件
    ScheduleConfirm.svelte
  routes/
    +layout.svelte
    +page.svelte
```

## 部署

项目使用 `@sveltejs/adapter-cloudflare`，Wrangler 配置位于 `wrangler.jsonc`，Pages 构建输出目录为 `.svelte-kit/cloudflare`。

构建：

```sh
pnpm build
```

本地预览 Cloudflare Pages 输出：

```sh
pnpm preview
```
