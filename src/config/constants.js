export const STORAGE_KEYS = {
  llmSettings: 'llm_settings',
  llmApiKeyLocal: 'llm_api_key_local',
  llmApiKeySession: 'llm_api_key_session',
  playerProgress: 'player_progress',
  currentGameState: 'current_game_state',
}

export const DEFAULT_LLM_SETTINGS = {
  provider: 'siliconflow',
  baseUrl: 'https://api.siliconflow.cn/v1',
  apiKey: '',
  rememberApiKey: false,
  chatModel: 'deepseek-ai/DeepSeek-V3.2',
  embeddingModel: 'netease-youdao/bce-embedding-base_v1',
}

export const SECRET_KEY = 'semantic_tower_xxx'

export const DEFAULT_PLAYER_PROGRESS = {
  currentFloor: 1,
  highestFloor: 0,
  pokedex: [],
}
