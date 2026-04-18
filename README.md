# 猜词（无限版）

[English Version](./README.en.md)

一个基于大模型 Embedding 的前端猜词游戏（BYOK 模式）。
核心玩法：AI 出题 -> 语义相似度反馈 -> 无限通关爬塔。

## 目录

- [功能亮点](#功能亮点)
- [当前产品决策](#当前产品决策)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [配置说明（BYOK）](#配置说明byok)
  - [推荐默认配置](#推荐默认配置)
- [NPM 脚本](#npm-脚本)
- [.env 示例](#env-示例)
- [安全策略](#安全策略)
- [仓库说明](#仓库说明)
- [本地存储结构](#本地存储结构)
- [常见问题](#常见问题)

## 功能亮点

- 纯前端实现（React + Vite + Tailwind）
- 多厂商模型接入（硅基流动 / 阿里云百炼 / OpenAI / 自定义兼容）
- 词向量余弦相似度计算（`toFixed(4)%` 展示）
- 目标词 AES 加密存储，降低本地明文泄露风险
- 本地进度持久化（当前关卡、最高层、历史通关记录）
- 设置页一键测试 Chat / Embedding 连通性
- 响应式 UI（移动端与桌面端）

## 当前产品决策

- 游戏内保持「不显示线索文案」（仅保留语义相似度反馈）
- 通关反馈保持「无礼花动画」，以轻量弹窗提示为主
- 厂商默认顺序：硅基流动 -> 阿里云百炼 -> OpenAI -> 自定义（OpenAI 兼容）

## 技术栈

- React 19
- Vite 8
- Tailwind CSS 4
- Axios
- CryptoJS
- React Router
- Lucide React

## 快速开始

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`

生产构建：

```bash
npm run build
npm run preview
```

## 配置说明（BYOK）

在游戏右上角「设置」中配置以下字段：

- `Base URL`
- `API Key`
- `对话模型`
- `向量模型`

支持厂商顺序（UI 默认）：

1. 硅基流动
2. 阿里云百炼
3. OpenAI
4. 自定义（OpenAI 兼容）

### 推荐默认配置

#### 硅基流动
- Base URL: `https://api.siliconflow.cn/v1`
- Chat: `deepseek-ai/DeepSeek-V3.2`
- Embedding: `netease-youdao/bce-embedding-base_v1`

#### 阿里云百炼
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Chat: `qwen3.6-flash`
- Embedding: `text-embedding-v4`

#### OpenAI
- Base URL: `https://api.openai.com/v1`
- Chat: `gpt-4o-mini`
- Embedding: `text-embedding-3-small`

#### 自定义（OpenAI 兼容）
- 填写兼容 OpenAI 协议的 Base URL、Chat 模型、Embedding 模型

## NPM 脚本

```bash
# 本地开发
npm run dev

# 生产构建
npm run build

# ESLint
npm run lint

# 本地预览生产包
npm run preview

# 使用 .env 测试各厂商 Chat/Embedding 连通性
npm run test:providers

# 发布前安全检查（会先 build）
npm run release:check
```

## .env 示例

```bash
cp .env.example .env
```

仅需填写要测试的厂商 Key；未填写的厂商会在 `test:providers` 中自动跳过。

## 安全策略

- 默认会话模式：不勾选“记住 Key”时，API Key 仅保存在 `sessionStorage`
- 勾选“记住 Key”后，Key 才会写入 `localStorage`
- 发布前运行 `npm run release:check` 检查：
  - 代码中是否包含疑似密钥
  - `.env.example` 是否误填真实 Key
  - 调试答案开关是否受 `import.meta.env.DEV` 保护

> 请勿提交 `.env` 到 GitHub（仓库已在 `.gitignore` 中忽略）。

## 仓库说明

- `游戏设计文档.md` 为本地内部文档，默认不提交到 GitHub

## 本地存储结构

- `llm_settings`：模型配置（不直接存明文 Key）
- `llm_api_key_local`：记住 Key 时使用
- `llm_api_key_session`：会话模式使用
- `player_progress`：爬塔进度与历史记录
- `current_game_state`：当前对局状态

## 常见问题

- **API Key 看起来是空的但还能生成？**
  设置弹窗草稿与已保存配置可能不一致，点击「保存配置」后生效。
- **401 / 403 错误**
  检查 Key 是否有效、模型权限与账户额度。
- **404 错误**
  检查 Base URL，常见为缺失 `/v1` 或百炼兼容路径错误。
- **429 错误**
  触发限流，稍后重试或降低调用频率。
