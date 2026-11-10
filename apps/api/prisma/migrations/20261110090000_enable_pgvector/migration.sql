-- pgvector backs the recommendation system: track audio embeddings, mood features and the
-- collaborative-filtering vectors are stored and searched (HNSW) inside this database rather
-- than in a separate vector store. See ADR-0071 and docs/specs/recommendations.md.
--
-- The extension is not marked trusted, so this needs a superuser role. Every compose file
-- connects as the image's POSTGRES_USER, which is one. A database whose application role is
-- not a superuser needs `CREATE EXTENSION vector;` run once by an administrator beforehand;
-- IF NOT EXISTS then makes this migration a no-op.
CREATE EXTENSION IF NOT EXISTS vector;
