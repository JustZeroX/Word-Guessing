import { useCallback, useMemo, useState } from 'react'
import { hasValidApiKey } from '../settings/settingsStorage'
import { createEmbedding } from '../../lib/api/llmApi'
import { decryptTargetWord } from '../../lib/utils/crypto'
import { cosineSimilarity } from '../../lib/utils/similarity'
import { generateLevel } from './levelGenerator'
import {
  clearCurrentGameState,
  getCurrentGameState,
  getPlayerProgress,
  resetAllGameProgress,
  saveCurrentGameState,
  savePlayerProgress,
} from './gameStorage'
import { DEFAULT_PLAYER_PROGRESS } from '../../config/constants'

export function useGameEngine(settings) {
  const [view, setView] = useState('hub')
  const [notices, setNotices] = useState([])
  const [guessInput, setGuessInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [playerProgress, setPlayerProgress] = useState(() => getPlayerProgress())
  const [currentGameState, setCurrentGameState] = useState(() => getCurrentGameState())
  const [winResult, setWinResult] = useState(null)
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
  const [revealedAnswer, setRevealedAnswer] = useState('')

  const canPlay = useMemo(() => hasValidApiKey(settings), [settings])
  const hasChallengeInProgress = useMemo(
    () => currentGameState?.floor === playerProgress.currentFloor,
    [currentGameState, playerProgress.currentFloor],
  )

  const pushNotice = useCallback((type, message, duration = 2800) => {
    const notice = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      message,
      duration,
    }
    setNotices((prev) => [...prev, notice].slice(-4))
  }, [])

  const dismissNotice = useCallback((id) => {
    setNotices((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toHub = useCallback(() => {
    setView('hub')
    setGuessInput('')
    setIsAnswerModalOpen(false)
    setRevealedAnswer('')
  }, [])

  const getExcludedWords = useCallback(() => {
    return playerProgress.pokedex.map((item) => item.targetWord).filter(Boolean)
  }, [playerProgress.pokedex])

  const createAndEnterLevel = useCallback(async (floor, options = {}) => {
    const { closeWinModalOnSuccess = false } = options

    setIsGenerating(true)
    try {
      const levelState = await generateLevel(settings, floor, {
        excludedWords: getExcludedWords(),
      })
      saveCurrentGameState(levelState)
      setCurrentGameState(levelState)
      setGuessInput('')
      setView('game')
      if (closeWinModalOnSuccess) {
        setWinResult(null)
      }
      return true
    } catch (engineError) {
      pushNotice('error', engineError.message || '生成关卡失败，请稍后重试。', 3600)
      return false
    } finally {
      setIsGenerating(false)
    }
  }, [getExcludedWords, pushNotice, settings])

  const startOrContinueChallenge = useCallback(async () => {
    if (!canPlay) {
      pushNotice('error', '请先在设置中配置 API Key。', 3600)
      return
    }

    if (hasChallengeInProgress) {
      setView('game')
      return
    }

    await createAndEnterLevel(playerProgress.currentFloor)
  }, [canPlay, createAndEnterLevel, hasChallengeInProgress, playerProgress.currentFloor, pushNotice])

  const submitGuess = useCallback(async () => {
    if (!currentGameState) return
    const trimmed = guessInput.trim()
    if (!trimmed) {
      pushNotice('error', '请输入一个猜测词。', 2400)
      return
    }

    setIsSubmitting(true)

    try {
      const embeddingData = await createEmbedding(settings, trimmed)
      const guessVector = embeddingData?.data?.[0]?.embedding
      if (!guessVector) throw new Error('未获取到猜测词向量，请稍后重试。')

      const similarity = Number(cosineSimilarity(guessVector, currentGameState.targetVector))
      const duplicated = currentGameState.guesses.some((item) => item.word === trimmed)
      const deduped = currentGameState.guesses.filter((item) => item.word !== trimmed)
      const updatedGameState = {
        ...currentGameState,
        lastGuessWord: trimmed,
        guesses: [...deduped, { word: trimmed, similarity, vector: guessVector }].sort(
          (a, b) => b.similarity - a.similarity,
        ),
      }

      saveCurrentGameState(updatedGameState)
      setCurrentGameState(updatedGameState)
      setGuessInput('')
      if (duplicated) {
        pushNotice('info', '该词已猜过，本次结果将覆盖旧记录并重新排序。')
      }

      let targetWord = decryptTargetWord(currentGameState.encryptedTargetWord)
      const isPass = targetWord === trimmed

      if (isPass) {
        const record = {
          floor: currentGameState.floor,
          targetWord,
          guessCount: updatedGameState.guesses.length,
          date: new Date().toISOString().slice(0, 10),
        }

        const nextProgress = {
          currentFloor: playerProgress.currentFloor + 1,
          highestFloor: Math.max(playerProgress.highestFloor, currentGameState.floor),
          pokedex: [record, ...playerProgress.pokedex],
        }

        savePlayerProgress(nextProgress)
        clearCurrentGameState()
        setPlayerProgress(nextProgress)
        setCurrentGameState(null)
        setWinResult(record)
        setView('hub')
        setIsAnswerModalOpen(false)
        setRevealedAnswer('')
      }

      targetWord = ''
    } catch (submitError) {
      pushNotice('error', submitError.message || '提交失败，请检查模型配置。', 3600)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentGameState, guessInput, playerProgress, pushNotice, settings])

  const closeWinModal = useCallback(() => setWinResult(null), [])
  const backFromWinModal = useCallback(() => {
    setWinResult(null)
    setView('hub')
  }, [])
  const goToNextLevel = useCallback(async () => {
    if (isGenerating) return
    await createAndEnterLevel(playerProgress.currentFloor, { closeWinModalOnSuccess: true })
  }, [createAndEnterLevel, isGenerating, playerProgress.currentFloor])
  const openAnswerModal = useCallback(() => {
    if (!currentGameState) return
    const answer = decryptTargetWord(currentGameState.encryptedTargetWord)
    setRevealedAnswer(answer)
    setIsAnswerModalOpen(true)
  }, [currentGameState])
  const closeAnswerModal = useCallback(() => {
    setIsAnswerModalOpen(false)
  }, [])
  const resetProgress = useCallback(() => {
    const ok = resetAllGameProgress()
    if (!ok) {
      pushNotice('error', '重置进度失败，请稍后重试。', 3600)
      return
    }
    setPlayerProgress(DEFAULT_PLAYER_PROGRESS)
    setCurrentGameState(null)
    setWinResult(null)
    setGuessInput('')
    setIsAnswerModalOpen(false)
    setRevealedAnswer('')
    setView('hub')
    pushNotice('success', '已清除本地答题进度，当前回到第一关。', 3000)
  }, [pushNotice])

  return {
    view,
    notices,
    guessInput,
    isGenerating,
    isSubmitting,
    canPlay,
    currentGameState,
    playerProgress,
    hasChallengeInProgress,
    winResult,
    isAnswerModalOpen,
    revealedAnswer,
    setGuessInput,
    toHub,
    startOrContinueChallenge,
    submitGuess,
    closeWinModal,
    backFromWinModal,
    goToNextLevel,
    openAnswerModal,
    closeAnswerModal,
    resetProgress,
    dismissNotice,
  }
}
