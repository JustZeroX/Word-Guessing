import { createUseLlmSettings } from '../../../packages/llm-settings-react/src/index'
import { getLlmSettings, saveLlmSettings } from './settingsStorage'

export const useLlmSettings = createUseLlmSettings({
  getLlmSettings,
  saveLlmSettings,
})
