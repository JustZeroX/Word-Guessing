import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const EXAMPLE_ENV = path.join(ROOT, '.env.example')
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
]

const SOURCE_SCAN_DIRS = ['src', 'public', 'scripts']
const SOURCE_SCAN_FILES = ['README.md', 'index.html', 'package.json', '.env.example']

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}

async function scanForSecrets() {
  const targets = []

  for (const dirName of SOURCE_SCAN_DIRS) {
    const dirPath = path.join(ROOT, dirName)
    try {
      const info = await stat(dirPath)
      if (info.isDirectory()) {
        const files = await walkFiles(dirPath)
        targets.push(...files)
      }
    } catch (_error) {
      // ignore missing directories
    }
  }

  for (const fileName of SOURCE_SCAN_FILES) {
    const filePath = path.join(ROOT, fileName)
    try {
      const info = await stat(filePath)
      if (info.isFile()) targets.push(filePath)
    } catch (_error) {
      // ignore missing files
    }
  }

  const leaks = []
  for (const filePath of targets) {
    const content = await readFile(filePath, 'utf8')
    for (const pattern of SECRET_PATTERNS) {
      const found = content.match(pattern)
      if (found?.length) {
        leaks.push({
          file: path.relative(ROOT, filePath),
          sample: found[0].slice(0, 8) + '***',
        })
      }
    }
  }

  if (leaks.length) {
    console.error('❌ 检测到疑似密钥，请先清理后再发布：')
    leaks.forEach((item) => {
      console.error(` - ${item.file} -> ${item.sample}`)
    })
    return false
  }

  return true
}

async function ensureEnvExampleNoRealKeys() {
  try {
    const content = await readFile(EXAMPLE_ENV, 'utf8')
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))

    for (const line of lines) {
      const [key, valueRaw] = line.split('=')
      const value = (valueRaw || '').trim()
      if (key.endsWith('API_KEY') && value) {
        console.error(`❌ .env.example 中 ${key} 不应包含真实值。`)
        return false
      }
    }
    return true
  } catch (_error) {
    console.error('❌ 缺少 .env.example，无法完成发布安全检查。')
    return false
  }
}

async function ensureDebugRevealGuardedByDev() {
  const appPath = path.join(ROOT, 'src', 'App.jsx')
  const gameplayPath = path.join(ROOT, 'src', 'features', 'game', 'components', 'GameplayView.jsx')

  try {
    const [appContent, gameplayContent] = await Promise.all([
      readFile(appPath, 'utf8'),
      readFile(gameplayPath, 'utf8'),
    ])

    const appGuarded =
      appContent.includes('const isDevMode = import.meta.env.DEV') &&
      appContent.includes('{isDevMode && (')
    const gameplayGuarded = gameplayContent.includes('enableDebugReveal && (')

    if (!appGuarded || !gameplayGuarded) {
      console.error('❌ 检测到答案测试功能未被 DEV 开关严格保护。')
      return false
    }

    return true
  } catch (_error) {
    console.error('❌ 无法验证答案测试开关保护逻辑。')
    return false
  }
}

async function main() {
  const checks = await Promise.all([
    scanForSecrets(),
    ensureEnvExampleNoRealKeys(),
    ensureDebugRevealGuardedByDev(),
  ])

  if (checks.every(Boolean)) {
    console.log('✅ 发布安全检查通过：未发现密钥泄露，且答案测试开关受 DEV 保护。')
    process.exit(0)
  }

  process.exit(1)
}

main()
