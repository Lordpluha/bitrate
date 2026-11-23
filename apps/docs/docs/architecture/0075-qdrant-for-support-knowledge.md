# ADR-0075: The support knowledge index lives in Qdrant; recommendation vectors stay in pgvector

Status: Accepted

Date: 2026-11-23

Tracked in [#567](https://github.com/Lordpluha/bitrate/issues/567). Partly an exception to
[ADR-0077](./0077-pgvector-in-postgres.md), which puts recommendation vectors
in PostgreSQL through pgvector and states that there is no separate vector store.

## Context

The support assistant ([ADR-0074](./0074-support-assistant-core-and-channels.md)) answers
from help articles and published legal texts in English, Ukrainian and Polish. It needs
semantic search, because users paraphrase and sometimes ask in one language about an
article written in another. Each chunk is filtered by audience and locale.

ADR-0077 chose pgvector for recommendations. Its main reason is that candidates must be
filtered by catalogue rules (published, not blocked, not deleted) next to the catalogue
data. The support knowledge base has none of that coupling. It is derived from markdown in
the repository, not from user or catalogue data, and it can be rebuilt at any time.

The owner was shown ADR-0077's rule and chose a dedicated vector database for the support
knowledge base anyway.

## Decision

- The support knowledge index is stored in **Qdrant**, in one collection per embedding
  model, with `audience`, `locale`, `source` and `url` payload fields indexed for filtering.
- **Qdrant holds derived data only.** The source of truth is the markdown in `apps/docs`.
  An idempotent ingest job on the worker rebuilds the collection. It runs after a change to
  the knowledge sources and on demand from the operator panel. Because the index can be
  rebuilt, it is **not backed up**. Conversations and tickets are user data, so they live in
  PostgreSQL under the existing backups
  ([ADR-0072](./0072-cloudflare-r2-production-storage-and-backups.md)).
- Qdrant runs as a single instance with a pinned image, an explicit memory limit and no
  public exposure. Only the API and the worker reach it, on the internal network.
- The core reaches it only through the `KnowledgeIndex` port. Moving the knowledge base to
  pgvector later is a new adapter plus a re-ingest, with no change to conversations.
- Recommendation vectors stay in PostgreSQL as ADR-0077 decides. This ADR does not allow
  other features to add vectors to Qdrant; each new use needs its own decision.

## Consequences

- One more stateful service on the single production node: a few hundred megabytes of RAM,
  a volume, a health check and an image to keep updated. Its memory limit is set in the
  infrastructure stage.
- A lost or corrupted volume costs a re-ingest, measured in minutes, not a restore from
  backup.
- Search quality and payload filtering are Qdrant's. Keyword matches inside its hybrid
  search replace PostgreSQL full-text search for this feature.
- Changing the embedding model creates a new collection and a full re-ingest. The old
  collection is dropped after the switch.

## Alternatives considered

- **pgvector, as ADR-0077 does.** No new service, and the knowledge base would share the
  database backup. Not chosen by the owner, who preferred a dedicated vector store for the
  assistant.
- **PostgreSQL full-text search only.** No embeddings and no new service, but it handles
  paraphrased and cross-language questions poorly.
- **A managed vector database.** No local operations, but one more external processor and a
  subscription for a small index.
