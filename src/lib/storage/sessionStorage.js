export function readSessionStorage(key, fallbackValue = '') {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ?? fallbackValue
  } catch {
    return fallbackValue
  }
}

export function writeSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeSessionStorage(key) {
  try {
    window.sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
