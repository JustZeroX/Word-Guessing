import axios from 'axios'
import { getProviderAdapter } from './providerAdapter'

export function createHttpClient({ provider, baseUrl, apiKey }) {
  const adapter = getProviderAdapter(provider)
  return axios.create({
    baseURL: adapter.normalizeBaseUrl(baseUrl),
    headers: adapter.buildHeaders(apiKey),
    timeout: 20000,
  })
}
