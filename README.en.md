# AI Semantic Word Guessing (Infinite Tower)

[中文版](./README.md)

A front-end word guessing game powered by LLM embeddings (BYOK mode).  
Core loop: AI generates a target word -> semantic similarity feedback -> infinite floor progression.

## Table of Contents

- [Highlights](#highlights)
- [Current Product Decisions](#current-product-decisions)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration (BYOK)](#configuration-byok)
  - [Recommended Defaults](#recommended-defaults)
- [NPM Scripts](#npm-scripts)
- [.env Example](#env-example)
- [Security Notes](#security-notes)
- [Repository Notes](#repository-notes)
- [Local Storage Keys](#local-storage-keys)
- [FAQ](#faq)
- [GitHub Submission Checklist](#github-submission-checklist)

## Highlights

- Pure front-end implementation (React + Vite + Tailwind)
- Multi-provider support (SiliconFlow / Alibaba Bailian / OpenAI / Custom compatible API)
- Cosine similarity scoring (`toFixed(4)%`)
- AES encryption for target word storage
- Local progress persistence (current floor, highest floor, history)
- One-click connection test for Chat and Embedding in settings
- Responsive UI for mobile and desktop

## Current Product Decisions

- No clue text is shown during gameplay (similarity feedback only)
- No confetti animation after passing a level (lightweight modal feedback)
- Provider order in UI: SiliconFlow -> Alibaba Bailian -> OpenAI -> Custom (OpenAI-compatible)

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Axios
- CryptoJS
- React Router
- Lucide React

## Quick Start

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

Production build:

```bash
npm run build
npm run preview
```

## Configuration (BYOK)

Configure these fields in the in-app Settings page:

- `Base URL`
- `API Key`
- `Chat Model`
- `Embedding Model`

Provider order in UI:

1. SiliconFlow
2. Alibaba Bailian
3. OpenAI
4. Custom (OpenAI-compatible)

### Recommended Defaults

#### SiliconFlow

- Base URL: `https://api.siliconflow.cn/v1`
- Chat: `deepseek-ai/DeepSeek-V3.2`
- Embedding: `netease-youdao/bce-embedding-base_v1`

#### Alibaba Bailian

- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Chat: `qwen3.6-flash`
- Embedding: `text-embedding-v4`

#### OpenAI

- Base URL: `https://api.openai.com/v1`
- Chat: `gpt-4o-mini`
- Embedding: `text-embedding-3-small`

#### Custom (OpenAI-compatible)

- Provide your own compatible Base URL, Chat model, and Embedding model

## NPM Scripts

```bash
# development
npm run dev

# production build
npm run build

# lint
npm run lint

# preview production build
npm run preview

# test provider connectivity using .env
npm run test:providers

# pre-release safety checks (includes build)
npm run release:check
```

## .env Example

The project includes `.env.example`. Create `.env` from it:

```bash
cp .env.example .env
```

You only need to fill keys for providers you want to test.  
Providers without keys are skipped by `test:providers`.

## Security Notes

- Default session mode: if "remember key" is disabled, API keys are stored in `sessionStorage` only
- If "remember key" is enabled, API keys are stored in `localStorage`
- `npm run release:check` validates:
  - potential secret leakage in source files
  - real keys mistakenly added to `.env.example`
  - debug answer reveal is guarded by `import.meta.env.DEV`

> Do not commit `.env` to GitHub. It is ignored by `.gitignore`.

## Repository Notes

- `游戏设计文档.md` is an internal local design document and should not be pushed to GitHub

## Local Storage Keys

- `llm_settings`: model settings (key itself is not stored here directly)
- `llm_api_key_local`: key store for remember-key mode
- `llm_api_key_session`: key store for session mode
- `player_progress`: floor progress and history
- `current_game_state`: current run state

## FAQ

- **Why can the game still generate words when API key looks empty?**  
  Usually because settings draft and saved settings are different. Click "Save" to apply changes.

- **401 / 403 errors**  
  Check API key validity, model permissions, and account quota.

- **404 errors**  
  Check Base URL, especially missing `/v1` or wrong Bailian compatible path.

- **429 errors**  
  Rate limit exceeded. Retry later or reduce request frequency.

## GitHub Submission Checklist

```bash
# 1) local checks
npm run lint
npm run release:check

# 2) commit (make sure .env is not staged)
git add .
git commit -m "docs: add bilingual README with TOC"

# 3) push
git push
```
