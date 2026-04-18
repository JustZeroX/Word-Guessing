export function readStorage(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallbackValue
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`Failed to read localStorage key: ${key}`, error)
    return fallbackValue
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error)
    return false
  }
}
