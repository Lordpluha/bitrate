# ADR-0074: One support assistant core, hosted by the API, with channel adapters for web and messengers

Status: Accepted

Date: 2026-11-23

Tracked in [#567](https://github.com/Lordpluha/bitrate/issues/567), which is also the
specification (acceptance criteria AC-1…AC-13).

## Context

Bitrate has no support channel besides one email address. Listeners and artists ask
different questions: account, sign-in and playback for listeners; releases, rights and
review for artists. The owner wants an AI assistant on both websites first, and then the
same assistant in Telegram, WhatsApp and Instagram. When the assistant cannot help, a
person must be able to take over.

Each channel has its own transport (SSE in a browser, Telegram webhooks, Meta Graph
webhooks), its own formatting and its own delivery rules. If the conversation logic lived
inside one transport, each new channel would mean a rewrite. The API already runs a
separate worker process with BullMQ and Redis, and an operator panel with its own API
process ([ADR-0068](./0068-operator-api-process.md)).

## Decision

- **Core.** The conversation logic is a framework-free package, `@bitrate/support-core`. It
  owns:
  - the domain: conversation, message, contact, channel, audience, ticket and the
    conversation state machine;
  - the agent loop, which turns an incoming message into a stream of events (text delta,
    citation, state change);
  - the ports: `ChatModel`, `Embedder`, `KnowledgeIndex`, `ConversationStore` and
    `ChannelAdapter`;
  - the markdown chunker and the formatters for each channel.

  It imports no NestJS, Prisma or host globals, so adapters and tests can run it anywhere.
- **Host.** A NestJS `support` module in `apps/api` hosts the core and implements its
  ports:
  - Prisma for conversations;
  - Redis for rate limits;
  - the knowledge index ([ADR-0075](./0075-qdrant-for-support-knowledge.md)).

  The public API serves the web channel. The operator API serves the inbox in
  `apps/admin`.
- **Channels.**
  - **Web:** an HTTP request answered with a Server-Sent Events stream.
  - **Messengers:** the Telegram webhook and one Meta webhook (WhatsApp Cloud API and
    Instagram Messaging) verify the request signature, enqueue a BullMQ job and
    acknowledge at once. The worker runs the core and sends the reply through the
    channel's `ChannelAdapter`. Operator replies use the same adapter, so a person
    answers in the channel the user wrote from.
- **Models.** The core talks to models only through its ports. The Vercel AI SDK
  implementation ships in the same package behind a separate entry,
  `@bitrate/support-core/ai-sdk`, so the core itself imports no model SDK. It resolves
  `provider:model` strings from configuration (`SUPPORT_CHAT_MODEL`,
  `SUPPORT_EMBED_MODEL`), so changing provider is a configuration change, not a code
  change. The API chooses which model serves a turn. Defaults:
  - chat: `anthropic:claude-haiku-5-5`, escalating hard cases to
    `anthropic:claude-sonnet-5-5`;
  - embeddings: `openai:text-embedding-3-small`.
- **Scope of the assistant in v1.** Two tools only:
  - `search_knowledge`, filtered by audience and locale;
  - `handoff_to_operator`.

  The assistant answers only about Bitrate, cites at least one source, and offers a
  handoff instead of guessing when retrieval is weak. It has no tool that changes user
  data, so a prompt injection has nothing to act on.
- **Audiences and identity.**
  - `listener` (web-player) and `artist` (web-artists) select the system prompt and the
    knowledge filter.
  - A signed-in web user's conversation carries the user id.
  - Guests and messenger users are anonymous contacts, identified by
    `(channel, externalId)`.
  - Linking a messenger contact to an account is deferred to the release that adds
    account actions.
- **Knowledge sources.** Help articles in `apps/docs/docs/help/<audience>/<locale>/`, plus an
  allowlist of published legal texts. Legal drafts with unfilled `[[placeholders]]` are
  never ingested.
- **Privacy.**
  - Message content stays out of logs and Sentry.
  - Conversations are deleted 90 days after the last message.
  - The Privacy Policy names Anthropic and OpenAI as processors before the first channel
    goes live, in the same change that launches it, not earlier. A policy must not
    describe processing that does not happen yet. The planned additions are listed below.

### Planned Privacy Policy additions (land with the web widget launch)

- **Section 3:** a row for support conversations. The data is the messages you send, the
  channel and its account identifier, and the language. The purpose is to answer support
  questions and hand them to a person. The legal basis is legitimate interest (6(1)(f)),
  or contract when the question is about your account.
- **Section 6:**
  - Anthropic PBC: support messages, to generate answers; USA, transfer safeguard to be
    confirmed from its DPA.
  - OpenAI: help-article text and the support message used for search; USA, transfer
    safeguard to be confirmed.
  - When the messenger channels launch, Telegram and Meta as the channels the user chose.
- **Section 8:** support conversations are deleted 90 days after the last message.
- **Section 11:** answers are generated automatically, have no legal effect, and a person
  is available on request.

## Consequences

- A new channel is a new `ChannelAdapter` plus a webhook controller; the core and the
  operator inbox do not change.
- The worker carries messenger traffic, so slow model calls never hold a webhook
  connection open, and Telegram or Meta retries do not duplicate work: jobs are
  idempotent on the channel's message id.
- WhatsApp and Instagram only allow free-form replies within 24 hours of the user's last
  message. The inbox must show the remaining window, and late operator replies need an
  approved WhatsApp template or Instagram's `HUMAN_AGENT` tag (7 days).
- Model calls cost money per message. Per-IP and per-contact rate limits and a token cap
  per conversation are mandatory, not optional hardening.
- Answer quality is checked with a manual evaluation set per audience and locale. It is not
  part of CI, because it calls paid models.
- Out of scope for v1: account actions, account linking for messengers, the mobile and
  desktop apps, voice messages.

## Alternatives considered

- **Everything inside one Nest module, no package.** Simpler at first, but the conversation
  logic would depend on Nest and Prisma, and every test would need the API's DI container.
- **A separate support service with its own deployment.** Cleaner isolation, but one more
  process and deployment on the single production node, for traffic the existing worker
  can carry.
- **One provider SDK used directly.** Less abstraction, but the owner chose to stay
  provider-agnostic from the start; the AI SDK provides that without our own adapters per
  vendor.
- **A hosted helpdesk with a built-in bot.** Fast to start, but it keeps conversations and
  knowledge outside Bitrate, adds a processor and a subscription, and its bot cannot use
  Bitrate's own knowledge filters per audience.
