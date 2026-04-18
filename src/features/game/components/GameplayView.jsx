import { useEffect, useRef } from 'react'
import { ArrowLeft, LoaderCircle, Send } from 'lucide-react'

function getHeatStyles(value) {
  if (value >= 100) return 'golden-hit bg-amber-500/20 text-amber-700 border-amber-300/70 dark:text-amber-100'
  if (value >= 50) return 'bg-emerald-500/15 text-emerald-700 border-emerald-300/40 dark:text-emerald-200'
  if (value >= 20) return 'bg-orange-500/15 text-orange-700 border-orange-300/40 dark:text-orange-200'
  return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
}

function getRowStyle(isLatest) {
  if (isLatest) {
    return {
      word: 'border-amber-300/70 bg-amber-500/20 text-amber-100',
      score: 'border-amber-300/70 bg-amber-500/20 text-amber-700 dark:text-amber-100',
    }
  }
  return {
    word: 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200',
    score:
      'border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300',
  }
}

function GameplayView({
  gameState,
  guessInput,
  isSubmitting,
  enableDebugReveal,
  onRevealAnswer,
  onGuessChange,
  onGuessSubmit,
  onBack,
}) {
  const rowRefs = useRef({})
  const bestWord = gameState.guesses[0]?.word

  useEffect(() => {
    if (!bestWord) return
    rowRefs.current[bestWord]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [bestWord])

  return (
    <section className="rounded-3xl border border-indigo-100/90 bg-white/85 p-4 shadow-2xl shadow-indigo-200/35 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-indigo-950/20 sm:p-6 md:p-8">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-semibold text-slate-600 transition hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200 sm:px-2"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <h1 className="justify-self-center text-2xl font-bold text-indigo-700 dark:text-indigo-200 sm:text-3xl md:text-4xl">
          第 {gameState.floor} 关
        </h1>
        <div />
      </header>

      <div className="mt-5 flex items-center justify-end gap-3">
        {enableDebugReveal && (
          <button
            className="text-xs text-indigo-700 underline decoration-dotted underline-offset-4 transition hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
            onClick={onRevealAnswer}
            type="button"
          >
            显示答案（测试）
          </button>
        )}
      </div>

      <div className="sticky top-2 z-10 mt-4 rounded-2xl border border-indigo-100 bg-white/95 p-3 shadow-lg shadow-indigo-100/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/50 sm:top-3 sm:p-4">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">已猜 {gameState.guesses.length} 次</p>
        <div className="relative">
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400/80"
            value={guessInput}
            placeholder="任意猜一个词汇……"
            onChange={(event) => onGuessChange(event.target.value)}
            disabled={isSubmitting}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onGuessSubmit()
            }}
          />
          <button
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            onClick={onGuessSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
            猜测
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {gameState.guesses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
            还没有猜测记录，先提交一个词试试语义温度。
          </p>
        ) : (
          gameState.guesses.map((item, index) => {
            const isLatest = item.word === gameState.lastGuessWord
            const rowStyle = getRowStyle(isLatest)
            return (
            <div
              key={item.word}
              ref={(element) => {
                rowRefs.current[item.word] = element
              }}
              className={`flex items-stretch gap-2 text-sm transition ${index === 0 ? 'best-focus' : ''}`}
            >
              <div
                className={`flex min-h-[48px] flex-1 items-center rounded-xl border px-4 py-3 font-medium ${
                  rowStyle.word
                } ${getHeatStyles(item.similarity)} ${item.similarity >= 100 ? 'guess-hit' : ''}`}
              >
                <span className="font-medium">
                  {item.word}
                  {index === 0 && (
                    <span className="ml-2 rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-200">
                      BEST
                    </span>
                  )}
                </span>
              </div>
              <div
                className={`flex min-h-[48px] min-w-[100px] items-center justify-center rounded-xl border px-3 py-3 text-right font-semibold sm:min-w-[110px] ${rowStyle.score}`}
              >
                {item.similarity.toFixed(4)}%
              </div>
            </div>
            )
          })
        )}
      </div>
    </section>
  )
}

export default GameplayView
