import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import SettingsModal from './features/settings/SettingsModal'
import { useLlmSettings } from './features/settings/useLlmSettings'
import HubView from './features/game/components/HubView'
import GameplayView from './features/game/components/GameplayView'
import PokedexModal from './features/game/components/PokedexModal'
import WinModal from './features/game/components/WinModal'
import AnswerRevealModal from './features/game/components/AnswerRevealModal'
import { useGameEngine } from './features/game/useGameEngine'
import { testProviderConnection } from './lib/api/llmApi'
import ToastStack from './components/ToastStack'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPokedexOpen, setIsPokedexOpen] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('ui_theme') || 'light')
  const { settings, updateSettings } = useLlmSettings()
  const game = useGameEngine(settings)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (game.view === 'hub' && location.pathname !== '/') {
      navigate('/', { replace: true })
    }
    if (game.view === 'game' && location.pathname !== '/game') {
      navigate('/game', { replace: true })
    }
  }, [game.view, location.pathname, navigate])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    window.localStorage.setItem('ui_theme', theme)
  }, [theme])

  const isDevMode = import.meta.env.DEV

  const handleTestConnection = async (draftSettings) => {
    return testProviderConnection(draftSettings)
  }
  const handleResetProgress = () => {
    const confirmed = window.confirm('确认清除本地缓存的答题进度吗？该操作无法撤销。')
    if (!confirmed) return
    game.resetProgress()
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-6 md:px-10 md:py-8">
      <div className="mb-3 flex justify-end sm:mb-4">
        <div className="inline-flex items-center rounded-xl border border-indigo-200 bg-white/90 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
          <button
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === 'light'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200'
            }`}
            onClick={() => setTheme('light')}
            type="button"
          >
            <Sun size={13} />
            浅色
          </button>
          <button
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === 'dark'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200'
            }`}
            onClick={() => setTheme('dark')}
            type="button"
          >
            <Moon size={13} />
            深色
          </button>
        </div>
      </div>
      <Routes>
        <Route
          path="/"
          element={(
            <HubView
              progress={game.playerProgress}
              canPlay={game.canPlay}
              canOpenPokedex={game.playerProgress.highestFloor > 0 && game.playerProgress.pokedex.length > 0}
              canResetProgress={game.playerProgress.pokedex.length > 0}
              hasChallengeInProgress={game.hasChallengeInProgress}
              isGenerating={game.isGenerating}
              onStart={game.startOrContinueChallenge}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenPokedex={() => setIsPokedexOpen(true)}
              onResetProgress={handleResetProgress}
            />
          )}
        />
        <Route
          path="/game"
          element={
            game.currentGameState ? (
              <GameplayView
                gameState={game.currentGameState}
                guessInput={game.guessInput}
                isSubmitting={game.isSubmitting}
                enableDebugReveal={isDevMode}
                onRevealAnswer={game.openAnswerModal}
                onGuessChange={game.setGuessInput}
                onGuessSubmit={game.submitGuess}
                onBack={game.toHub}
              />
            ) : (
              <div className="rounded-2xl border border-slate-300 bg-white/85 p-5 text-sm text-slate-700 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                当前没有进行中的关卡，请返回大厅重新开始挑战。
              </div>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SettingsModal
        key={`${settings.provider}-${settings.baseUrl}-${settings.apiKey}-${settings.chatModel}-${settings.embeddingModel}`}
        open={isSettingsOpen}
        initialValues={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSubmit={updateSettings}
        onTestConnection={handleTestConnection}
      />

      <PokedexModal
        open={isPokedexOpen}
        records={game.playerProgress.pokedex}
        onClose={() => setIsPokedexOpen(false)}
      />

      <WinModal
        result={game.winResult}
        onBack={game.backFromWinModal}
        onNext={game.goToNextLevel}
        isLoadingNext={game.isGenerating}
      />
      {isDevMode && (
        <AnswerRevealModal
          open={game.isAnswerModalOpen}
          answer={game.revealedAnswer}
          floor={game.currentGameState?.floor || game.playerProgress.currentFloor}
          onClose={game.closeAnswerModal}
        />
      )}
      <ToastStack toasts={game.notices} onDismiss={game.dismissNotice} />
    </main>
  )
}

export default App
