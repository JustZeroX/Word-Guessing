import {
  getDefaultProviderId,
  getProviderPreset,
  PROVIDER_PRESETS,
} from './providers'

function normalizeProvider(provider) {
  if (provider === 'trajectoryFlow') return 'siliconflow'
  return PROVIDER_PRESETS[provider] ? provider : getDefaultProviderId()
}

export function createLlmSettingsStore({
  defaultSettings,
  storageKeys,
  readStorage,
  writeStorage,
  readSessionStorage,
  writeSessionStorage,
  removeSessionStorage,
}) {
  function readApiKey(rememberApiKey) {
    if (rememberApiKey) {
      return readStorage(storageKeys.llmApiKeyLocal, '') || ''
    }
    return readSessionStorage(storageKeys.llmApiKeySession, '')
  }

  function getLlmSettings() {
    const saved = readStorage(storageKeys.llmSettings, defaultSettings)
    const rememberApiKey = Boolean(saved?.rememberApiKey)
    const apiKey = readApiKey(rememberApiKey)

    if (saved?.apiKey) {
      if (rememberApiKey) {
        writeStorage(storageKeys.llmApiKeyLocal, saved.apiKey)
      } else {
        writeSessionStorage(storageKeys.llmApiKeySession, saved.apiKey)
      }
      writeStorage(storageKeys.llmSettings, { ...saved, apiKey: '' })
    }

    return {
      ...defaultSettings,
      ...saved,
      provider: normalizeProvider(saved?.provider),
      apiKey,
      rememberApiKey,
    }
  }

  function saveLlmSettings(payload) {
    const provider = normalizeProvider(payload?.provider)
    const rememberApiKey = Boolean(payload?.rememberApiKey)
    const apiKey = payload?.apiKey?.trim() || ''
    const merged = {
      ...defaultSettings,
      ...payload,
      provider,
      apiKey: '',
      rememberApiKey,
    }

    const configSaved = writeStorage(storageKeys.llmSettings, merged)
    if (!configSaved) return false

    if (rememberApiKey) {
      writeStorage(storageKeys.llmApiKeyLocal, apiKey)
      removeSessionStorage(storageKeys.llmApiKeySession)
    } else {
      writeSessionStorage(storageKeys.llmApiKeySession, apiKey)
      writeStorage(storageKeys.llmApiKeyLocal, '')
    }

    return true
  }

  function hasValidApiKey(settings) {
    return Boolean(settings?.apiKey?.trim())
  }

  function applyProviderPreset(settings, provider) {
    const preset = getProviderPreset(provider)
    return {
      ...settings,
      provider: preset.id,
      baseUrl: preset.baseUrl,
      chatModel: preset.chatModel,
      embeddingModel: preset.embeddingModel,
    }
  }

  return {
    getLlmSettings,
    saveLlmSettings,
    hasValidApiKey,
    applyProviderPreset,
  }
}
