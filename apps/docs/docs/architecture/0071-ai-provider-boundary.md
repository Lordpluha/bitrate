# ADR-0071: AI calls go through one provider boundary, routed by task and limited to EU processing

Status: Proposed

Date: 2026-11-19

Spec: [AI artist promotion](../specs/ai-artist-promotion.md).

## Context

The first AI feature in the product, AI artist promotion, generates promotion plans, post copy
and translations for artists. The [tech roadmap](../strategy/tech-roadmap.md#stage-4--the-ai-layer)
asks for a few commitments to be made once, at the start of the AI layer: a provider boundary,
grounding, cost as a product constraint, the composition boundary and transparency.

The model market moves faster than the product. A comparison made on 2026-11-10 found
announced price rises at one vendor within weeks, a mid-tier model withdrawn at another, and no
public evidence for any vendor's Ukrainian or Polish quality. The model that is right today
will be replaced, and different tasks need different price points: a plan needs reasoning, a
translation needs only language quality.

Requests carry artists' personal data (name, bio, profile text), and Bitrate serves EU users.

## Decision

- **One boundary.** `apps/api/src/infra/ai/` owns every call to a model provider. It exposes
  an `AiProvider` interface with structured (schema-validated) output and a `Translator`
  interface. Provider SDKs, such as `@anthropic-ai/sdk` or Mistral's client, are imported only by
  adapters inside that directory. Domain modules, such as `promotion`, depend on the interfaces,
  never on an SDK, and a controller never calls a model. An oxlint JS plugin beside
  `prisma-write-ownership` enforces the import rule.
- **Routing by task, from configuration.** Callers name a task, not a model: `A` plan
  generation, `B` copy, `C` translation, `D` moderation and validation. Configuration maps each
  task to a provider, a model and a fallback. Changing a model is a configuration change. The
  starting defaults are in the spec and are set by an eval, not by price lists.
- **EU processing only.** A provider can be enabled in production only when it processes
  in the EU, has a DPA with Bitrate and does not train on the data. Configuration validation at
  boot rejects any other provider in production. Every enabled provider is listed as a
  sub-processor in the [privacy policy](../legal/privacy-policy.md).
- **Asynchronous by default.** Generation runs as BullMQ jobs on an `ai` queue in the worker
  service ([ADR-0049](./0049-transcode-worker-process-boundary.md)), never inside an HTTP
  request.
- **Every call is accounted for.** Each provider call writes an `AiUsage` row: artist, task,
  provider, model, input, cached and output tokens, cost and outcome. The boundary owns that
  table ([ADR-0060](./0060-api-data-write-ownership.md)). Per-artist quotas and cost ceilings
  read from it before a job is enqueued.
- **Grounding and transparency are enforced at the boundary's edge.** Callers pass a
  structured context. Output that fails its schema, or that states facts absent from the
  context, is rejected. Every AI-generated record carries a flag that the UI renders as a
  "Created with AI" marker.
- **The composition boundary holds.** No task generates, edits or analyses the audio itself.
  AI applies to the release and the career
  ([vision](../strategy/vision.md#what-bitrate-deliberately-does-not-do)).

## Consequences

- Swapping or adding a model, or moving one task to a cheaper model, needs no change in a
  domain module. A provider outage is handled by the configured fallback, not by callers.
- Each new provider requires a due-diligence step (EU region, DPA, no training) before it can
  be switched on in production, even when it is cheaper.
- Prompt caching and batch discounts are adapter concerns. The interfaces must therefore keep
  the stable context (artist and release) separate from the variable request.
- Cost per artist is visible from the first call and can be compared against the
  [business model](../strategy/business-model.md).
- The `ai` queue adds load to the worker service, so its concurrency is configured separately
  from transcoding.
- Out of scope: autonomous actions (Stage 5), embeddings and recommendations, and
  self-hosted models. Each would extend this boundary through its own ADR.

## Alternatives considered

- **One provider called directly from the domain modules**: fastest to start, but every
  model change touches business code, and the roadmap rules it out explicitly.
- **A third-party gateway or aggregator as the boundary**: adds a sub-processor, usually
  outside the EU, and hides cost and caching details the product needs to see.
- **A framework abstraction (LangChain-style) instead of our own interface**: the four tasks
  need little more than structured output, so a framework would add a large dependency surface
  for little gain.
- **Synchronous generation in the request**: simpler, but plan generation takes tens of seconds
  and would hold HTTP connections and API memory.
