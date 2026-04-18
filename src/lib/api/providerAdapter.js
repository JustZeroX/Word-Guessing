function normalizeOpenAiCompatibleBaseUrl(baseUrl = '') {
  return baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '')
}

function normalizeAliyunCompatibleBaseUrl(baseUrl = '') {
  const sanitized = baseUrl.replace(/\/+$/, '')
  if (!sanitized) return sanitized
  if (sanitized.includes('/compatible-mode')) {
    return sanitized.replace(/\/v1$/, '')
  }
  return `${sanitized}/compatible-mode`
}

const defaultAdapter = {
  providerName: 'OpenAI-Compatible',
  chatEndpoint: '/v1/chat/completions',
  embeddingEndpoint: '/v1/embeddings',
  normalizeBaseUrl: normalizeOpenAiCompatibleBaseUrl,
  traceHeaderKey: null,
  buildHeaders: (apiKey) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }),
  buildChatPayload: (payload) => payload,
  buildEmbeddingPayload: (payload) => payload,
}

const adapterByProvider = {
  openai: {
    ...defaultAdapter,
    providerName: 'OpenAI',
  },
  siliconflow: {
    ...defaultAdapter,
    providerName: 'SiliconFlow',
    traceHeaderKey: 'x-siliconcloud-trace-id',
  },
  aliyun: {
    ...defaultAdapter,
    providerName: '阿里云百炼',
    traceHeaderKey: 'x-request-id',
    normalizeBaseUrl: normalizeAliyunCompatibleBaseUrl,
  },
  custom: {
    ...defaultAdapter,
    providerName: '自定义兼容服务',
  },
}

export function getProviderAdapter(provider) {
  return adapterByProvider[provider] || defaultAdapter
}
