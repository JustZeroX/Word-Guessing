import { BookOpenText, Play, Settings } from 'lucide-react'

function HubView({
  progress,
  canPlay,
  canResetProgress,
  hasChallengeInProgress,
  isGenerating,
  onStart,
  onOpenSettings,
  onOpenPokedex,
  onResetProgress,
}) {
  return (
    <section className="rounded-3xl border border-indigo-100/90 bg-white/85 p-4 shadow-2xl shadow-indigo-200/40 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-indigo-950/20 sm:p-6 md:p-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl">
            当前挑战：第 {progress.currentFloor} 关
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">历史最高：第 {progress.highestFloor} 关</p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          onClick={onOpenSettings}
        >
          <Settings size={16} />
          设置
        </button>
      </header>

      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:justify-start">
        <button
          className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 sm:w-auto sm:max-w-none sm:min-w-[170px] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          onClick={onStart}
          disabled={!canPlay || isGenerating}
        >
          <Play size={16} />
          {isGenerating
            ? '正在生成关卡...'
            : hasChallengeInProgress
              ? '继续挑战'
              : '开始挑战'}
        </button>

        <button
          className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 sm:w-auto sm:max-w-none sm:min-w-[170px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          onClick={onOpenPokedex}
        >
          <BookOpenText size={16} />
          历史关卡
        </button>
        {canResetProgress && (
          <button
            className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 sm:w-auto sm:max-w-none sm:min-w-[170px] dark:text-rose-200"
            onClick={onResetProgress}
          >
            清除本地进度
          </button>
        )}
      </div>

      {!canPlay && (
        <p className="mt-4 text-xs text-amber-700 dark:text-amber-300/90">
          未配置 API Key，请先在设置中保存后再开始挑战。
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">怎么玩？</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>您有无限机会来尝试猜出一个中文词汇。</li>
          <li>百分比代表和目标词汇的关联程度，越大关联性越高。</li>
          <li>每次尝试后，你可以看到本次猜测与正确答案的关联程度。</li>
        </ul>
      </div>
    </section>
  )
}

export default HubView
