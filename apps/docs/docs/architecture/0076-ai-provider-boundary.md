# ADR-0076: AI promotion calls models through the AI SDK, routed by task, under a DPA with no training

Status: Proposed

Date: 2026-11-19 (aligned with ADR-0074 on 2026-11-23)

Spec: [AI artist promotion](../specs/ai-artist-promotion.md).

## Context

AI artist promotion generates promotion plans, post copy and translations for artists. The
[tech roadmap](../strategy/tech-roadmap.md#stage-4--the-ai-layer) asks for a few commitments
at the start of the AI layer: a provider boundary, grounding, cost as a product constraint,
the composition boundary and transparency.

[ADR-0074](./0074-support-assistant-core-and-channels.md) already decided how the API reaches
models for the support assistant: through the Vercel AI SDK, which resolves `provider:model`
strings from configuration, so changing provider is a configuration change. A second,
hand-written model layer for promotion would give the API two ways of doing the same thing.

Promotion needs things the support assistant does not:

- several tasks with different price points, since a plan needs reasoning and a translation
  needs only language quality;
- per-artist cost accounting and quotas, because generation is a paid product feature;
- output that must be grounded in release data.

The model market also moves faster than the product. A comparison on 2026-11-10 found an
announced price rise at one vendor within weeks, a mid-tier model withdrawn at another, and no
public evidence of any vendor's Ukrainian or Polish quality.

Requests carry a small amount of artists' personal data, almost all of it already public on the
artist page (name, bio, genres, track titles), and Bitrate serves EU users.

## Decision

- **Same model access as ADR-0074.** Promotion calls models through the Vercel AI SDK. It uses
  structured output validated against a schema. Provider packages are imported only in
  `apps/api/src/modules/promotion/ai/`, the module's model adapter. The rest of the module
  depends on that adapter's interface, and no controller calls a model. A Biome `noRestrictedImports` override in
  `apps/api/biome.json` enforces the import rule.
- **Routing by task, from configuration.** Callers name a task, not a model: `A` plan
  generation, `B` copy, `C` translation, `D` moderation and validation. Each task has a
  `provider:model` string and a fallback in configuration (`PROMOTION_MODEL_A` …), so
  changing a model needs no code change. The starting defaults are in the spec, and an eval
  sets them, not price lists.
- **Translation behind a `Translator` port.** The default implementation is a task `C` model
  call. DeepL API Pro can implement the same port.
- **A DPA, no training, and minimal data.** A provider can be enabled in production only when:
  - it has a DPA with Bitrate that covers transfers outside the EU (Standard Contractual
    Clauses);
  - it does not train on the data.

  EU-region processing is preferred but not required. Configuration validation at boot
  rejects any provider not on the approved list. Requests carry only the fields the task
  needs, taken from the artist's public profile and release metadata: never email addresses,
  listener data or payment data. As ADR-0074 already does for support, the privacy policy
  (`legal/privacy-policy.md`, published at bitrate.me/legal/privacy) names each provider and
  the country where it processes data. The entry is added in the same change that switches
  promotion on, not earlier.
- **Asynchronous.** Generation runs as BullMQ jobs on a `promotion` queue, never inside an
  HTTP request. The API process consumes it, as it does release publishing; the transcode
  worker ([ADR-0049](./0049-transcode-worker-process-boundary.md)) stays audio-only.
- **Every call is accounted for.** Each model call writes an `AiUsage` row with: artist, task,
  provider, model, input, cached and output tokens, cost, and outcome. The token counts come
  from the AI SDK's usage result. The promotion module owns that table
  ([ADR-0060](./0060-api-data-write-ownership.md)). Before a job is enqueued, per-artist
  quotas and cost ceilings are read from it. The table names a feature, so support or a later
  AI feature can record its own calls in it.
- **Grounding and transparency.** Callers pass a structured context. Output that fails its
  schema, or that states facts absent from the context, is rejected. Every AI-generated record
  carries a flag that the UI renders as a "Created with AI" marker.
- **The composition boundary holds.** No task generates, edits or analyses the audio itself:
  AI applies to the release and the career
  ([vision](../strategy/vision.md#what-bitrate-deliberately-does-not-do)).

### Provider due diligence (2026-11-20)

Checked against official vendor pages on 2026-11-20. Re-check before a provider is switched on.

| Provider | EU processing | DPA | No training | Verdict under this ADR |
|---|---|---|---|---|
| Anthropic, first-party API | **No.** `inference_geo` offers only `us` and `global` ([data residency](https://platform.claude.com/docs/en/manage-claude/data-residency)). The Anthropic-managed Google Cloud offering is the same, and Microsoft Foundry offers only a US data zone | Yes, part of the Commercial Terms, with SCCs | Yes; retained 30 days | **Allowed: the Claude route** (processing in the US) |
| Claude on Google Vertex AI, `eu` multi-region | **Yes** for Haiku, Sonnet and Opus 5.5. The `eu` endpoint keeps data in EU member states ([Vertex data residency](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency)); the `global` endpoint gives no guarantee | Google Cloud's DPA (Google is the processor) | Yes | Allowed; kept for strict EU residency |
| Claude on Amazon Bedrock, `eu.` inference profile | Confirmed for Sonnet 5.5 only, when called from an EU-member region; calls from London or Zurich can be routed outside the EU | AWS DPA | Yes | Possible alternative; not chosen |
| Mistral, `api.eu.mistral.ai` | **Yes** for inference ([regional inference](https://docs.mistral.ai/inference/regional-inference)). The control plane is not regional, and Batch and Files are not available there. Whether Large 4 and Small 4 are served there must be checked with `models.list` | Yes | Opt-out: switch it off for the organization, and use no Labs or Preview models | **Allowed, with conditions** |
| DeepL API Pro | **Not guaranteed.** DeepL chooses the location unless the Data Residency Add-On is bought | Yes | Yes; debug copies kept up to 72 hours; free tier excluded | **Allowed** on API Pro, not the free tier |

Consequences for the defaults in the spec:

- **Claude is called through Anthropic's own API** (`anthropic:` in the AI SDK), under its DPA,
  with processing in the US. This matches ADR-0074's support defaults and needs no second
  cloud account. If a customer later requires strict EU residency, the AI SDK's Vertex
  provider is configured instead, with no change to the promotion module.
- **Mistral** is the fallback (`mistral:`) on the EU endpoint. Before it is enabled, the
  training opt-out must be on and both models must be confirmed there.
- **Translation uses the LLM route by default.** DeepL (API Pro only) is an allowed alternative
  behind the `Translator` port, and the eval decides whether it is used.

## Consequences

- The API has one way of calling models. Support and promotion differ only in configuration
  and in the ports they expose.
- Swapping a model, or moving one task to a cheaper model, is a configuration change. A
  provider outage is handled by the configured fallback, not by callers.
- Each new provider needs a due-diligence step before it can be switched on in production,
  even when it is cheaper: DPA with SCCs, no training, and where it processes data.
- Prompt caching and batch discounts depend on what the AI SDK exposes for each provider. The
  adapter keeps the stable context (artist and release) ahead of the variable request so that
  caching can apply.
- Cost per artist is visible from the first call and can be compared against the
  [business model](../strategy/business-model.md).
- The `promotion` queue runs in the API process. Model calls wait on the network, not the CPU,
  so they do not compete with audio work; if they ever load the API, the consumer can move to
  the worker without changing the queue.
- Out of scope: autonomous actions (Stage 5), embeddings and recommendations, and self-hosted
  models. Each needs its own ADR.

## Alternatives considered

- **A separate hand-written `AiProvider` interface with one adapter per provider SDK** (this
  ADR's first draft): full control over every provider feature, but it would sit next to
  ADR-0074's AI SDK route and give the API two model layers. Replaced on 2026-11-23.
- **One shared AI module that support and promotion both use, with shared accounting**:
  cleaner in the long term, but it would change how ADR-0074 is implemented while support is
  being built. It can be extracted later, because both features already use the same SDK and
  configuration format.
- **EU processing only** (also in the first draft): Claude would go through Google Vertex AI's
  `eu` endpoint, because Anthropic's own API offers no EU region. Rejected on 2026-11-23:
  GDPR permits transfers under a DPA with SCCs, the data sent is almost all public, and a
  second cloud account with a further sub-processor adds cost and operations for little gain.
- **A third-party gateway or aggregator**: adds a sub-processor, usually outside the EU, and
  hides the cost and caching details the product needs to see.
- **Synchronous generation in the request**: simpler, but plan generation takes tens of
  seconds and would hold HTTP connections and API memory.
