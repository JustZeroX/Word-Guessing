# llm-settings-core

可复用的大模型设置与调用核心模块（Headless，不绑定 UI 框架）。

## 能力范围

- 服务商预设与展示顺序管理
- LLM 设置读写（含 local/session API Key 策略）
- OpenAI 兼容协议的 Chat / Embedding 调用
- 服务连接测试（包含 trace-id 诊断信息）

## 导出 API

- `createLlmSettingsStore(...)`
- `createLlmApiClient(...)`
- `getProviderOptions()`
- `getProviderModelSuggestions(provider)`
- `applyProviderPresetToSettings(settings, provider)`
- 以及 `PROVIDER_PRESETS` / `PROVIDER_DISPLAY_ORDER`

## 快速接入（最小示例）

```js
import { createLlmSettingsStore, createLlmApiClient } from './packages/llm-settings-core/src'
import { readStorage, writeStorage } from './src/lib/storage/localStorage'
import { readSessionStorage, writeSessionStorage, removeSessionStorage } from './src/lib/storage/sessionStorage'
import { createHttpClient } from './src/lib/api/httpClient'
import { getApiErrorMessage } from './src/lib/api/errorMessage'

const defaultSettings = {
  provider: 'siliconflow',
  baseUrl: 'https://api.siliconflow.cn/v1',
  apiKey: '',
  rememberApiKey: false,
  chatModel: 'deepseek-ai/DeepSeek-V3.2',
  embeddingModel: 'netease-youdao/bce-embedding-base_v1',
}

const storageKeys = {
  llmSettings: 'llm_settings',
  llmApiKeyLocal: 'llm_api_key_local',
  llmApiKeySession: 'llm_api_key_session',
}

export const llmSettingsStore = createLlmSettingsStore({
  defaultSettings,
  storageKeys,
  readStorage,
  writeStorage,
  readSessionStorage,
  writeSessionStorage,
  removeSessionStorage,
})

export const llmApiClient = createLlmApiClient({
  createHttpClient,
  getApiErrorMessage,
})
```

## 设计原则

- Core 仅包含业务逻辑，不包含 UI。
- 通过依赖注入适配各项目差异，避免硬编码项目特定实现。
- 默认配置可覆盖，便于在不同产品中快速复用。
