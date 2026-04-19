import { createHttpClient } from './httpClient'
import { getApiErrorMessage } from './errorMessage'
import { createLlmApiClient } from '../../../packages/llm-settings-core/src/index'

const llmApiClient = createLlmApiClient({
  createHttpClient,
  getApiErrorMessage,
})

export const {
  chatCompletions,
  createEmbedding,
  testProviderConnection,
} = llmApiClient
