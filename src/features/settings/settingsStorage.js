import { DEFAULT_LLM_SETTINGS, STORAGE_KEYS } from '../../config/constants'
import { readStorage, writeStorage } from '../../lib/storage/localStorage'
import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from '../../lib/storage/sessionStorage'
import {
  createLlmSettingsStore,
} from '../../../packages/llm-settings-core/src/index'

const llmSettingsStore = createLlmSettingsStore({
  defaultSettings: DEFAULT_LLM_SETTINGS,
  storageKeys: STORAGE_KEYS,
  readStorage,
  writeStorage,
  readSessionStorage,
  writeSessionStorage,
  removeSessionStorage,
})

export const {
  getLlmSettings,
  saveLlmSettings,
  hasValidApiKey,
  applyProviderPreset,
} = llmSettingsStore
