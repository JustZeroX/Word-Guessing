import { useEffect } from 'react'

function getToastClass(type) {
  if (type === 'error') {
    return 'border-rose-300/70 bg-rose-50/95 text-rose-800 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-100'
  }
  if (type === 'success') {
    return 'border-emerald-300/70 bg-emerald-50/95 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100'
  }
  return 'border-indigo-300/70 bg-indigo-50/95 text-indigo-800 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100'
}

function ToastStack({ toasts, onDismiss }) {
  useEffect(() => {
    if (!toasts.length) return undefined
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), toast.duration ?? 2800),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [onDismiss, toasts])

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[70] flex w-[min(94vw,420px)] flex-col gap-2 sm:right-4 sm:top-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md transition ${getToastClass(
            toast.type,
          )}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default ToastStack
