import { createHttpClient } from './httpClient'
import { getApiErrorMessage } from './errorMessage'
import { getProviderAdapter } from './providerAdapter'

function getRequestOptions(settings) {
  const adapter = getProviderAdapter(settings.provider)
  const client = createHttpClient(settings)
  const errorOptions = {
    providerLabel: adapter.providerName,
    traceHeaderKey: adapter.traceHeaderKey,
  }
  return { adapter, client, errorOptions }
}

export async function chatCompletions(settings, messages, overrides = {}) {
  const { adapter, client, errorOptions } = getRequestOptions(settings)
  try {
    const payload = adapter.buildChatPayload({
      model: settings.chatModel,
      messages,
      temperature: 0.8,
      ...overrides,
    })
    const response = await client.post(adapter.chatEndpoint, payload)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '对话接口调用失败。', errorOptions))
  }
}

export async function createEmbedding(settings, input, overrides = {}) {
  const { adapter, client, errorOptions } = getRequestOptions(settings)
  try {
    const payload = adapter.buildEmbeddingPayload({
      model: settings.embeddingModel,
      input,
      ...overrides,
    })
    const response = await client.post(adapter.embeddingEndpoint, payload)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '向量接口调用失败。', errorOptions))
  }
}

export async function testProviderConnection(settings) {
  const { adapter, client, errorOptions } = getRequestOptions(settings)
  try {
    const chatResponse = await client.post(
      adapter.chatEndpoint,
      adapter.buildChatPayload({
        model: settings.chatModel,
        messages: [{ role: 'user', content: '请仅回复 OK。' }],
        temperature: 0,
        max_tokens: 8,
      }),
    )

    const embeddingResponse = await client.post(
      adapter.embeddingEndpoint,
      adapter.buildEmbeddingPayload({
        model: settings.embeddingModel,
        input: '连接测试',
      }),
    )

    const chatTraceId = adapter.traceHeaderKey
      ? chatResponse.headers?.[adapter.traceHeaderKey]
      : ''
    const embeddingTraceId = adapter.traceHeaderKey
      ? embeddingResponse.headers?.[adapter.traceHeaderKey]
      : ''

    const traceParts = [chatTraceId && `chat=${chatTraceId}`, embeddingTraceId && `embedding=${embeddingTraceId}`]
      .filter(Boolean)
      .join(' | ')

    return {
      success: true,
      message: traceParts
        ? `${adapter.providerName} 连接正常。${traceParts}`
        : `${adapter.providerName} 的 Chat 与 Embedding 接口均可用。`,
      diagnostics: {
        providerName: adapter.providerName,
        chatTraceId,
        embeddingTraceId,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: getApiErrorMessage(error, '连接测试失败。', errorOptions),
    }
  }
}
