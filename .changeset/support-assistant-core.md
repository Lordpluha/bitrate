---
'@bitrate/support-core': minor
---

Added the support assistant core (#569). `SupportAgent` turns a user message into streamed events: it searches the help knowledge base, answers with citations, or hands the conversation to an operator. The package also contains the conversation state machine, a help-article parser and chunker, renderers for web, Telegram, WhatsApp and Instagram, and a Vercel AI SDK adapter that resolves `provider:model` ids for Anthropic and OpenAI.
