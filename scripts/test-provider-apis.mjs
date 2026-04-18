const DEFAULTS = {
  openai: {
    label: 'OpenAI',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  siliconflow: {
    label: '硅基流动',
    baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
    apiKey: process.env.SILICONFLOW_API_KEY || '',
    chatModel: process.env.SILICONFLOW_CHAT_MODEL || 'deepseek-ai/DeepSeek-V3.2',
    embeddingModel:
      process.env.SILICONFLOW_EMBEDDING_MODEL || 'netease-youdao/bce-embedding-base_v1',
  },
  aliyun: {
    label: '阿里云百炼',
    baseUrl: process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.ALIYUN_API_KEY || '',
    chatModel: process.env.ALIYUN_CHAT_MODEL || 'qwen3.6-flash',
    embeddingModel: process.env.ALIYUN_EMBEDDING_MODEL || 'text-embedding-v4',
  },
}

function normalizeRoot(baseUrl) {
  return String(baseUrl).trim().replace(/\/+$/, '').replace(/\/v1$/, '')
}

async function postJson(url, apiKey, body) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    let data = null
    try {
      data = await response.json()
    } catch (_error) {
      data = null
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    }
  } finally {
    clearTimeout(timer)
  }
}

function pickErrorMessage(result) {
  if (!result) return '无响应'
  return (
    result?.data?.error?.message ||
    result?.data?.message ||
    result?.data?.data ||
    `HTTP ${result.status}`
  )
}

function pickTrace(result) {
  if (!result?.headers) return ''
  return (
    result.headers.get('x-siliconcloud-trace-id') ||
    result.headers.get('x-request-id') ||
    result.headers.get('x-trace-id') ||
    ''
  )
}

async function testProvider(providerConfig) {
  const root = normalizeRoot(providerConfig.baseUrl)
  const chatUrl = `${root}/v1/chat/completions`
  const embeddingUrl = `${root}/v1/embeddings`

  const chatResult = await postJson(chatUrl, providerConfig.apiKey, {
    model: providerConfig.chatModel,
    messages: [{ role: 'user', content: '请仅回复 OK。' }],
    temperature: 0,
    max_tokens: 8,
  })

  const embeddingResult = await postJson(embeddingUrl, providerConfig.apiKey, {
    model: providerConfig.embeddingModel,
    input: '连接测试',
  })

  const chatOk = chatResult.ok
  const embeddingOk = embeddingResult.ok

  return {
    provider: providerConfig.label,
    chat: chatOk ? 'PASS' : `FAIL (${pickErrorMessage(chatResult)})`,
    embedding: embeddingOk ? 'PASS' : `FAIL (${pickErrorMessage(embeddingResult)})`,
    trace:
      [pickTrace(chatResult), pickTrace(embeddingResult)]
        .filter(Boolean)
        .join(' | ') || '-',
  }
}

async function main() {
  const enabledProviders = Object.values(DEFAULTS).filter((item) => item.apiKey.trim())
  if (!enabledProviders.length) {
    console.log('未发现可用 API Key。请先在 .env 文件填入至少一个厂商的 KEY。')
    process.exit(0)
  }

  const rows = []
  for (const providerConfig of enabledProviders) {
    try {
      const row = await testProvider(providerConfig)
      rows.push(row)
    } catch (error) {
      rows.push({
        provider: providerConfig.label,
        chat: 'FAIL',
        embedding: 'FAIL',
        trace: `脚本异常: ${error.message}`,
      })
    }
  }

  console.log('\n=== Provider API 连通性测试 ===')
  console.table(rows)

  const hasFailed = rows.some(
    (row) => row.chat.startsWith('FAIL') || row.embedding.startsWith('FAIL'),
  )
  process.exit(hasFailed ? 1 : 0)
}

main()
