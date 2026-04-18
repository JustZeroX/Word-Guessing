import { useCallback, useMemo, useState } from 'react'
import { getLlmSettings, saveLlmSettings } from './settingsStorage'

export function useLlmSettings() {
  const [settings, setSettings] = useState(() => getLlmSettings())

  const updateSettings = useCallback((payload) => {
    const nextSettings = { ...settings, ...payload }
    const isSaved = saveLlmSettings(nextSettings)
    if (isSaved) {
      setSettings(nextSettings)
    }
    return isSaved
  }, [settings])

  return useMemo(
    () => ({ settings, updateSettings }),
    [settings, updateSettings],
  )
}
