import axios from 'axios'

function maskSensitiveText(input = '') {
  return String(input)
    .replace(/sk-[A-Za-z0-9_-]{10,}/g, 'sk-***')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***')
}

export function getApiErrorMessage(
  error,
  fallback = '请求失败，请稍后重试。',
  options = {},
) {
  if (!axios.isAxiosError(error)) return fallback

  const { providerLabel, traceHeaderKey } = options
  const traceId = traceHeaderKey ? error.response?.headers?.[traceHeaderKey] : ''
  const traceTail = traceId ? `（trace-id: ${traceId}）` : ''
  const providerTail = providerLabel ? ` [${providerLabel}]` : ''

  const status = error.response?.status
  if (status === 401) return `鉴权失败（401），请检查 API Key 是否正确。${providerTail}${traceTail}`
  if (status === 403) return `当前 Key 没有访问权限（403），请检查模型或额度。${providerTail}${traceTail}`
  if (status === 404) return `接口地址不存在（404），请检查 Base URL 是否正确。${providerTail}${traceTail}`
  if (status === 429) return `请求过于频繁（429），请稍后再试。${providerTail}${traceTail}`
  if (status && status >= 500) return `服务异常（${status}），请稍后重试。${providerTail}${traceTail}`
  if (error.code === 'ECONNABORTED') return `请求超时，请检查网络或降低请求频率。${providerTail}`
  if (error.message?.includes('Network Error')) return `网络连接失败，请检查代理与 Base URL。${providerTail}`

  const vendorError =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.response?.data?.data

  return `${maskSensitiveText(vendorError || fallback)}${providerTail}${traceTail}`
}
