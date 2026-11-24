---
'@bitrate/support-core': minor
---

`createSupportModels().chatModel(id, { effort })` and `aiSdkChatModel` take an optional reasoning effort, passed to Anthropic models as `providerOptions.anthropic.effort`. Support answers can run at `low` effort, and thinking tokens, which are billed as output, stay within the budget.
