import { useCallback, useMemo, useState } from 'react'

export function createUseLlmSettings({ getLlmSettings, saveLlmSettings }) {
  return function useLlmSettings() {
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
}
