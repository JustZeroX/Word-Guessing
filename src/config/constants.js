export const STORAGE_KEYS = {
  llmSettings: 'llm_settings',
  llmApiKeyLocal: 'llm_api_key_local',
  llmApiKeySession: 'llm_api_key_session',
  playerProgress: 'player_progress',
  currentGameState: 'current_game_state',
}

export const DEFAULT_LLM_SETTINGS = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  rememberApiKey: false,
  chatModel: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
}

export const SECRET_KEY = 'semantic_tower_xxx'

export const DEFAULT_PLAYER_PROGRESS = {
  currentFloor: 1,
  highestFloor: 0,
  pokedex: [],
}
