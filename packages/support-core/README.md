# @bitrate/support-core

The framework-free core of the Bitrate support assistant
([ADR-0074](../../apps/docs/docs/architecture/0074-support-assistant-core-and-channels.md),
specification [#567](https://github.com/Lordpluha/bitrate/issues/567)). It turns one user
message into a stream of events, using the knowledge base to answer or handing the
conversation to a person. Persistence, rate limits and delivery belong to the host
(`apps/api`).

## Entry points

| Import | Contents |
|---|---|
| `@bitrate/support-core` | `SupportAgent`, conversation `transition`, `parseHelpArticle` / `chunkKnowledgeDocument`, `renderForChannel`, domain types and ports. No model SDK. |
| `@bitrate/support-core/ai-sdk` | `createSupportModels`: resolves `provider:model` ids (`anthropic`, `openai`) to `ChatModel` / `Embedder` through the Vercel AI SDK. |

ESM only. `apps/api` is CommonJS, so it loads the package with `await import()`, as it
already does for `@bitrate/converter`.

## One turn

```ts
import { SupportAgent } from '@bitrate/support-core'
import { createSupportModels } from '@bitrate/support-core/ai-sdk'

const models = createSupportModels({ anthropicApiKey, openaiApiKey })
const agent = new SupportAgent({
  chatModel: models.chatModel('anthropic:claude-haiku-5-5'),
  embedder: models.embedder('openai:text-embedding-3-small'),
  index, // a KnowledgeIndex, e.g. the Qdrant adapter
})

for await (const event of agent.respond({ conversation, message })) {
  // text-delta → stream to the user; state → persist; citation → show sources;
  // done → store the answer, usage and outcome
}
```

The agent owns the tool loop:

1. The first step must call a tool: `search_knowledge`, or `handoff_to_operator`.
2. Search results reach the model as `<article>` data.
3. The last step must answer in text, so a turn always ends in text.

When search finds nothing relevant, the model gets `NO_RELEVANT_ARTICLES` and no
citations are emitted. A handoff ends the turn with a fixed message in the user's
language. While a person owns the conversation, the agent does not call the model.

## Checks

```bash
pnpm --filter @bitrate/support-core test
pnpm --filter @bitrate/support-core check-types
pnpm --filter @bitrate/support-core build
```

Tests use scripted fakes from `src/testing/` and the AI SDK's mock models; they never call
a real provider.
