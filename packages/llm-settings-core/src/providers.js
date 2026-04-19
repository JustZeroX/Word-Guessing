export const PROVIDER_PRESETS = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    iconFile: 'openai.svg',
    baseUrl: 'https://api.openai.com/v1',
    chatModel: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    recommendedChatModels: ['gpt-4o-mini', 'gpt-4.1-mini'],
    recommendedEmbeddingModels: ['text-embedding-3-small', 'text-embedding-3-large'],
  },
  siliconflow: {
    id: 'siliconflow',
    label: '硅基流动',
    iconFile: 'siliconflow.svg',
    baseUrl: 'https://api.siliconflow.cn/v1',
    chatModel: 'deepseek-ai/DeepSeek-V3.2',
    embeddingModel: 'netease-youdao/bce-embedding-base_v1',
    recommendedChatModels: ['deepseek-ai/DeepSeek-V3.2', 'Qwen/Qwen3.5-397B-A17B'],
    recommendedEmbeddingModels: ['netease-youdao/bce-embedding-base_v1', 'Qwen/Qwen3-Embedding-8B'],
  },
  aliyun: {
    id: 'aliyun',
    label: '阿里云百炼',
    iconFile: 'bailian.svg',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    chatModel: 'qwen3.6-flash',
    embeddingModel: 'text-embedding-v4',
    recommendedChatModels: ['qwen3.6-flash'],
    recommendedEmbeddingModels: ['text-embedding-v4'],
  },
  custom: {
    id: 'custom',
    label: '自定义（OpenAI 兼容）',
    iconFile: '',
    baseUrl: 'https://your-openai-compatible-endpoint/v1',
    chatModel: 'your-chat-model',
    embeddingModel: 'your-embedding-model',
    recommendedChatModels: [],
    recommendedEmbeddingModels: [],
  },
}

export const PROVIDER_DISPLAY_ORDER = ['siliconflow', 'aliyun', 'openai', 'custom']

export function getProviderPreset(provider) {
  return PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom
}

export function getDefaultProviderId() {
  return PROVIDER_DISPLAY_ORDER[0]
}

export function getProviderOptions() {
  return PROVIDER_DISPLAY_ORDER.map((providerId) => {
    const item = PROVIDER_PRESETS[providerId]
    return {
      value: item.id,
      label: item.label,
      iconFile: item.iconFile || '',
    }
  })
}

export function getProviderModelSuggestions(provider) {
  const preset = getProviderPreset(provider)
  return {
    chatModels: preset.recommendedChatModels || [],
    embeddingModels: preset.recommendedEmbeddingModels || [],
  }
}

export function applyProviderPresetToSettings(settings, provider) {
  const preset = getProviderPreset(provider)
  return {
    ...settings,
    provider: preset.id,
    baseUrl: preset.baseUrl,
    chatModel: preset.chatModel,
    embeddingModel: preset.embeddingModel,
  }
}
