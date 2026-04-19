import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

function PokedexModal({ open, records, onClose }) {
  const [selectedFloor, setSelectedFloor] = useState(null)
  const orderedRecords = useMemo(
    () => [...records].sort((a, b) => a.floor - b.floor),
    [records],
  )
  const selectedRecord = useMemo(
    () => orderedRecords.find((item) => item.floor === selectedFloor) || null,
    [orderedRecords, selectedFloor],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4">
      <button
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/70"
        onClick={onClose}
        aria-label="关闭图鉴"
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-2xl shadow-indigo-100/70 dark:border-slate-700/60 dark:bg-slate-900/95 dark:shadow-none sm:p-6">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">历史关卡</h3>
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
          {orderedRecords.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
              暂无通关记录。
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {orderedRecords.map((record) => (
                  <button
                    key={`${record.floor}-${record.date}`}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      selectedFloor === record.floor
                        ? 'border-indigo-300/70 bg-indigo-500/15 text-indigo-700 dark:text-indigo-100'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400/70 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-400/50'
                    }`}
                    onClick={() => setSelectedFloor(record.floor)}
                  >
                    第 {record.floor} 关
                  </button>
                ))}
              </div>
              {selectedRecord ? (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-200">
                  <p>关卡：第 {selectedRecord.floor} 关</p>
                  <p className="mt-1">目标词：{selectedRecord.targetWord}</p>
                  <p className="mt-1">猜测次数：{selectedRecord.guessCount}</p>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">通关日期：{selectedRecord.date}</p>
                </div>
              ) : (
                <div className="h-2" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PokedexModal
