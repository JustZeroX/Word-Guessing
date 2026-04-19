# llm-settings-react

`llm-settings-core` 的 React 适配层。

## 导出

- `createUseLlmSettings({ getLlmSettings, saveLlmSettings })`
- `LlmSettingsModal`

## 说明

- `createUseLlmSettings` 用于快速生成项目侧的 `useLlmSettings` Hook。
- `LlmSettingsModal` 为可直接复用的设置弹窗 UI，内部依赖 `llm-settings-core` 的服务商与推荐模型能力。
