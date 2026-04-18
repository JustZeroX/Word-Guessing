import { PartyPopper } from 'lucide-react'

function WinModal({ result, onBack, onNext, isLoadingNext }) {
  if (!result) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80"
        onClick={isLoadingNext ? undefined : onBack}
        aria-label="关闭通关提示并返回"
      />
      <div className="relative z-20 w-full max-w-md rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 text-center shadow-2xl shadow-indigo-200/50 dark:border-indigo-400/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:shadow-indigo-950/40 sm:p-6">
        <div className="mx-auto mb-3 inline-flex rounded-full bg-indigo-500/15 p-3 text-indigo-700 dark:text-indigo-200">
          <PartyPopper size={20} />
        </div>
        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-100">恭喜通关！</h3>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 sm:text-base">
          你在第 {result.floor} 关用了 {result.guessCount} 次，猜出目标词「{result.targetWord}」
        </p>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-300 dark:hover:text-indigo-200"
            onClick={onBack}
            disabled={isLoadingNext}
          >
            返回
          </button>
          <button
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 dark:disabled:bg-slate-600 dark:disabled:text-slate-300"
            onClick={onNext}
            disabled={isLoadingNext}
          >
            {isLoadingNext ? '生成中...' : '下一关'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinModal
