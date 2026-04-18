import { DEFAULT_LLM_SETTINGS, STORAGE_KEYS } from '../../config/constants'
import { PROVIDER_PRESETS, getDefaultProviderId, getProviderPreset } from '../../config/providers'
import { readStorage, writeStorage } from '../../lib/storage/localStorage'
import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from '../../lib/storage/sessionStorage'

function normalizeProvider(provider) {
  if (provider === 'trajectoryFlow') return 'siliconflow'
  return PROVIDER_PRESETS[provider] ? provider : getDefaultProviderId()
}

function readApiKey(rememberApiKey) {
  if (rememberApiKey) {
    return readStorage(STORAGE_KEYS.llmApiKeyLocal, '') || ''
  }
  return readSessionStorage(STORAGE_KEYS.llmApiKeySession, '')
}

export function getLlmSettings() {
  const saved = readStorage(STORAGE_KEYS.llmSettings, DEFAULT_LLM_SETTINGS)
  const rememberApiKey = Boolean(saved?.rememberApiKey)
  const apiKey = readApiKey(rememberApiKey)

  // Migration: older versions stored apiKey directly in llm_settings.
  if (saved?.apiKey) {
    if (rememberApiKey) {
      writeStorage(STORAGE_KEYS.llmApiKeyLocal, saved.apiKey)
    } else {
      writeSessionStorage(STORAGE_KEYS.llmApiKeySession, saved.apiKey)
    }
    writeStorage(STORAGE_KEYS.llmSettings, { ...saved, apiKey: '' })
  }

  return {
    ...DEFAULT_LLM_SETTINGS,
    ...saved,
    provider: normalizeProvider(saved?.provider),
    apiKey,
    rememberApiKey,
  }
}

export function saveLlmSettings(payload) {
  const provider = normalizeProvider(payload?.provider)
  const rememberApiKey = Boolean(payload?.rememberApiKey)
  const apiKey = payload?.apiKey?.trim() || ''
  const merged = {
    ...DEFAULT_LLM_SETTINGS,
    ...payload,
    provider,
    apiKey: '',
    rememberApiKey,
  }

  const configSaved = writeStorage(STORAGE_KEYS.llmSettings, merged)
  if (!configSaved) return false

  if (rememberApiKey) {
    writeStorage(STORAGE_KEYS.llmApiKeyLocal, apiKey)
    removeSessionStorage(STORAGE_KEYS.llmApiKeySession)
  } else {
    writeSessionStorage(STORAGE_KEYS.llmApiKeySession, apiKey)
    writeStorage(STORAGE_KEYS.llmApiKeyLocal, '')
  }

  return true
}

export function hasValidApiKey(settings) {
  return Boolean(settings?.apiKey?.trim())
}

export function applyProviderPreset(settings, provider) {
  const preset = getProviderPreset(provider)
  return {
    ...settings,
    provider: preset.id,
    baseUrl: preset.baseUrl,
    chatModel: preset.chatModel,
    embeddingModel: preset.embeddingModel,
  }
}
