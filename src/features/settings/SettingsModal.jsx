import { useState } from 'react'
import { X, Save, KeyRound, SlidersHorizontal, WandSparkles } from 'lucide-react'
import { getProviderModelSuggestions, getProviderOptions } from '../../config/providers'
import { applyProviderPreset } from './settingsStorage'

const INPUT_CLASSNAME =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/25 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400/80'

function SettingsModal({
  open,
  initialValues,
  onClose,
  onSubmit,
  onTestConnection,
}) {
  const [formState, setFormState] = useState(initialValues)
  const [error, setError] = useState('')
  const [testStatus, setTestStatus] = useState('idle')
  const [testMessage, setTestMessage] = useState('')
  const [testTrace, setTestTrace] = useState('')
  const providerOptions = getProviderOptions()
  const modelSuggestions = getProviderModelSuggestions(formState.provider)

  const renderProviderIcon = (item) => {
    if (item.iconFile) {
      const iconSrc = `${import.meta.env.BASE_URL}provider-icons/${item.iconFile}`
      return (
        <img
          src={iconSrc}
          alt={`${item.label} icon`}
          className="h-3.5 w-3.5 object-contain opacity-95 dark:brightness-0 dark:invert"
          loading="lazy"
        />
      )
    }
    return <SlidersHorizontal size={14} />
  }

  if (!open) return null

  const updateField = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    setError('')
    setTestStatus('idle')
    setTestMessage('')
    setTestTrace('')
  }

  const updateProvider = (provider) => {
    setFormState((prev) => applyProviderPreset(prev, provider))
    setError('')
    setTestStatus('idle')
    setTestMessage('')
    setTestTrace('')
  }

  const toggleRememberApiKey = () => {
    setFormState((prev) => ({ ...prev, rememberApiKey: !prev.rememberApiKey }))
  }

  const handleSave = () => {
    if (
      !formState.baseUrl.trim() ||
      !formState.apiKey.trim() ||
      !formState.chatModel.trim() ||
      !formState.embeddingModel.trim()
    ) {
      setError('请完整填写 Base URL、API Key、对话模型与向量模型。')
      return
    }

    const success = onSubmit({
      ...formState,
      provider: formState.provider,
      baseUrl: formState.baseUrl.trim(),
      apiKey: formState.apiKey.trim(),
      rememberApiKey: Boolean(formState.rememberApiKey),
      chatModel: formState.chatModel.trim(),
      embeddingModel: formState.embeddingModel.trim(),
    })

    if (!success) {
      setError('保存失败，请检查浏览器 localStorage 可用性后重试。')
      return
    }

    onClose()
  }

  const handleTest = async () => {
    if (!onTestConnection) return
    if (
      !formState.baseUrl.trim() ||
      !formState.apiKey.trim() ||
      !formState.chatModel.trim() ||
      !formState.embeddingModel.trim()
    ) {
      setTestStatus('error')
      setTestMessage('请先完整填写配置，再执行连接测试。')
      return
    }

    setTestStatus('loading')
    setTestMessage('')
    setTestTrace('')
    const result = await onTestConnection({
      ...formState,
      baseUrl: formState.baseUrl.trim(),
      apiKey: formState.apiKey.trim(),
      rememberApiKey: Boolean(formState.rememberApiKey),
      chatModel: formState.chatModel.trim(),
      embeddingModel: formState.embeddingModel.trim(),
    })

    if (result?.success) {
      setTestStatus('success')
      setTestMessage(result.message || '连接测试成功。')
      if (result?.diagnostics) {
        const traceParts = [
          result.diagnostics.chatTraceId && `chat=${result.diagnostics.chatTraceId}`,
          result.diagnostics.embeddingTraceId && `embedding=${result.diagnostics.embeddingTraceId}`,
        ].filter(Boolean)
        setTestTrace(traceParts.join(' | '))
      }
      return
    }

    setTestStatus('error')
    setTestMessage(result?.message || '连接测试失败，请检查配置后重试。')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-slate-950/70"
        onClick={onClose}
        aria-label="关闭设置弹窗"
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-2xl shadow-indigo-100/70 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-none sm:p-6">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-500/15 p-2 text-indigo-700 dark:text-indigo-300">
              <KeyRound size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">大模型配置</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">本地保存，不上传到第三方。</p>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">服务厂商</label>
            <div className="flex flex-wrap gap-2">
              {providerOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    formState.provider === item.value
                      ? 'border-indigo-300/70 bg-indigo-500/15 text-indigo-700 dark:text-indigo-100'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400/70 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-indigo-400/50'
                  }`}
                  onClick={() => updateProvider(item.value)}
                >
                  <span className="mr-1.5 inline-flex items-center align-middle">
                    {renderProviderIcon(item)}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Base URL</label>
            <input
              className={INPUT_CLASSNAME}
              value={formState.baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={updateField('baseUrl')}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">API Key</label>
            <input
              className={INPUT_CLASSNAME}
              type="password"
              value={formState.apiKey}
              placeholder="sk-xxxxxxxx"
              onChange={updateField('apiKey')}
            />
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <input
                type="checkbox"
                checked={Boolean(formState.rememberApiKey)}
                onChange={toggleRememberApiKey}
              />
              记住 Key 到本地（更方便，但安全性较低）
            </label>
            {!formState.rememberApiKey && (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-300/90">
                当前为会话模式：关闭浏览器后 Key 自动失效。
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">对话模型</label>
              <input
                className={INPUT_CLASSNAME}
                value={formState.chatModel}
                placeholder="gpt-4o-mini"
                list="chat-model-suggestions"
                onChange={updateField('chatModel')}
              />
              <datalist id="chat-model-suggestions">
                {modelSuggestions.chatModels.map((modelId) => (
                  <option key={modelId} value={modelId} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">向量模型</label>
              <input
                className={INPUT_CLASSNAME}
                value={formState.embeddingModel}
                placeholder="text-embedding-3-small"
                list="embedding-model-suggestions"
                onChange={updateField('embeddingModel')}
              />
              <datalist id="embedding-model-suggestions">
                {modelSuggestions.embeddingModels.map((modelId) => (
                  <option key={modelId} value={modelId} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="mt-5 min-h-5 text-xs text-rose-600 dark:text-rose-300">{error}</div>
        <div
          className={`min-h-5 text-xs ${
            testStatus === 'success'
              ? 'text-emerald-600 dark:text-emerald-300'
              : testStatus === 'error'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {testMessage}
        </div>
        <div className="min-h-5 text-[11px] text-slate-500 dark:text-slate-400">
          {testTrace ? `trace-id: ${testTrace}` : ''}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-200"
            onClick={handleTest}
            disabled={testStatus === 'loading'}
          >
            {testStatus === 'loading' ? '测试中...' : '测试连接'}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/45 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-500/15 dark:text-indigo-200"
            onClick={() => setFormState((prev) => applyProviderPreset(prev, formState.provider))}
          >
            <WandSparkles size={16} />
            应用厂商推荐配置
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.99]"
            onClick={handleSave}
          >
            <Save size={16} />
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
