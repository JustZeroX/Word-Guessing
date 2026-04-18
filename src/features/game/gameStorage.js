import { DEFAULT_PLAYER_PROGRESS, STORAGE_KEYS } from '../../config/constants'
import { readStorage, writeStorage } from '../../lib/storage/localStorage'

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

export function resetAllGameProgress() {
  const progressSaved = writeStorage(STORAGE_KEYS.playerProgress, DEFAULT_PLAYER_PROGRESS)
  const gameSaved = writeStorage(STORAGE_KEYS.currentGameState, null)
  return progressSaved && gameSaved
}
