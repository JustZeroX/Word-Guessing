import { X } from 'lucide-react'

function AnswerRevealModal({ open, answer, floor, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80"
        onClick={onClose}
        aria-label="关闭答案弹窗"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-cyan-400/30 bg-white/95 p-6 shadow-2xl shadow-cyan-200/30 dark:bg-slate-900/95 dark:shadow-cyan-900/20">
        <button
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={16} />
        </button>

        <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-300">测试模块</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">第 {floor} 关答案</h3>
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-bold text-amber-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-amber-200">
          {answer || '暂无答案'}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">仅用于本地测试，请勿在正式环境暴露。</p>
      </div>
    </div>
  )
}

export default AnswerRevealModal
