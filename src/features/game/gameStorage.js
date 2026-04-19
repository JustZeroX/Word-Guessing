import { DEFAULT_PLAYER_PROGRESS, STORAGE_KEYS } from '../../config/constants'
import { readStorage, writeStorage } from '../../lib/storage/localStorage'

const RECENT_WORDS_LIMIT = 30

export function getPlayerProgress() {
  const saved = readStorage(STORAGE_KEYS.playerProgress, DEFAULT_PLAYER_PROGRESS)
  return { ...DEFAULT_PLAYER_PROGRESS, ...saved }
}

export function savePlayerProgress(progress) {
  return writeStorage(STORAGE_KEYS.playerProgress, progress)
}

export function getCurrentGameState() {
  return readStorage(STORAGE_KEYS.currentGameState, null)
}

export function saveCurrentGameState(gameState) {
  return writeStorage(STORAGE_KEYS.currentGameState, gameState)
}

export function clearCurrentGameState() {
  return writeStorage(STORAGE_KEYS.currentGameState, null)
}

export function getRecentGeneratedWords() {
  const saved = readStorage(STORAGE_KEYS.recentGeneratedWords, [])
  if (!Array.isArray(saved)) return []
  return saved
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

export function saveRecentGeneratedWords(words) {
  const normalized = Array.isArray(words)
    ? words.map((item) => String(item || '').trim()).filter(Boolean)
    : []
  const deduped = Array.from(new Set(normalized))
  const nextWords = deduped.slice(-RECENT_WORDS_LIMIT)
  return writeStorage(STORAGE_KEYS.recentGeneratedWords, nextWords)
}

export function appendRecentGeneratedWord(word) {
  const normalizedWord = String(word || '').trim()
  if (!normalizedWord) return false
  const current = getRecentGeneratedWords().filter((item) => item !== normalizedWord)
  return saveRecentGeneratedWords([...current, normalizedWord])
}

export function resetAllGameProgress() {
  const progressSaved = writeStorage(STORAGE_KEYS.playerProgress, DEFAULT_PLAYER_PROGRESS)
  const gameSaved = writeStorage(STORAGE_KEYS.currentGameState, null)
  return progressSaved && gameSaved
}
