# ADR-0071: Recommendation vectors live in PostgreSQL through pgvector, on our own alpine image

Status: Accepted

Date: 2026-11-10

Tracked in [#518](https://github.com/Lordpluha/bitrate/issues/518). Specification:
[Recommendation system](../specs/recommendations.md).

## Context

The recommendation system stores and searches vectors: track audio embeddings, mood features
(valence, energy) and the user and track factors of collaborative filtering. Candidates must be
filtered by the same rules the catalogue already enforces (published, not moderation-blocked,
explicit setting, not deleted), so nearest-neighbour search has to sit next to that data.

Every environment ran the stock `postgres:16-alpine` image, which has no pgvector. The upstream
`pgvector/pgvector` image is Debian. Its server uses glibc collation, while the existing data
directories were initialised under musl. Starting a musl-initialised `en_US.utf8` database on a
glibc server changes the sort order under every existing btree index on text (`email`,
`username`, `slug`, ISRC). Lookups then miss rows quietly until a full `REINDEX`.

## Decision

- Vectors are stored in the existing PostgreSQL database with the pgvector extension and
  searched there with HNSW indexes. Redis keeps caching and queue duties only. There is no
  separate vector store.
- The database runs on our own image, `infra/postgres/Dockerfile`: `postgres:16-alpine` with
  pgvector compiled from a pinned, checksummed release tarball. Same base and libc as before, so
  existing volumes attach unchanged.
- Dev and preprod build that Dockerfile through compose. CI's API tests start Postgres from the
  preprod definition, which uses the same Dockerfile. Production pulls
  `ghcr.io/lordpluha/bitrate/postgres:16-pgvector<version>`, published by
  `.github/workflows/postgres_image.yml`.
- The production database image is versioned on its own tag and is not rebuilt per release. A
  rebuild changes the digest, and every deploy would restart the database. The tag in
  `infra/docker-compose.prod.yaml` is the source of truth. The workflow checks it against the
  Dockerfile's `PGVECTOR_VERSION` and never overwrites a published tag unless a person re-runs it
  with `republish`.
- The extension is created by the Prisma migration `20261110090000_enable_pgvector`. The Prisma
  schema does not declare it: without the `postgresqlExtensions` preview feature, Prisma neither
  introspects nor drops extensions. Vector columns will use `Unsupported("vector(n)")`, and
  similarity queries will use `queryRaw`, which is the existing pattern for trigram search.

## Consequences

- No new datastore to operate, back up or secure. Vector search obeys the same transactions,
  row filters and cascading deletes as the catalogue.
- `CREATE EXTENSION vector` needs a superuser, because pgvector is not a trusted extension. The
  compose environments connect as the image's `POSTGRES_USER`, which is one. A database whose
  application role is not a superuser needs the extension created once by an administrator
  before the migration runs.
- The first production deploy after this change restarts the database container on the new
  image. After that, the database restarts only when the pinned tag changes.
- Upgrading pgvector means bumping `PGVECTOR_VERSION` and its checksum in the Dockerfile and the
  tag in the prod compose file in one change, then running `ALTER EXTENSION vector UPDATE`
  through a migration.
- At catalogue scale beyond a few million vectors, or for heavy analytical queries over playback
  events, a dedicated store may be needed later. That would be a new decision, not a default.

## Alternatives considered

- **Upstream `pgvector/pgvector:pg16` (Debian)** — the simplest swap, but existing alpine
  volumes would need a dump/restore or a full `REINDEX`, which is risky to do silently in
  production. It is fine for a brand-new database, but it would also make CI run a different
  libc from production.
- **A separate vector database (Qdrant, Milvus)** — another service to run and keep consistent
  with the catalogue. Every query would need a second round of filtering against Postgres.
  Unnecessary at this size.
- **Rebuild the database image in each release** — keeps one tag scheme for every image, but
  restarts the database on every deploy for no change in content.
