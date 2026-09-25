-- Global per-day listen aggregation (admin overview daily series). The existing indexes on
-- ListeningHistory — [userId, listenedAt DESC] and [trackId] — both lead with a column the
-- admin dashboard's global "listens per day" query never filters on, so neither serves a
-- date_trunc('day', "listenedAt") GROUP BY across every user. This adds a plain index on
-- "listenedAt" alone.
--
-- Hand-written, not machine-generated: `prisma migrate dev` was not run under this session's
-- memory pressure. This migration was checked against the rule that a generated diff for this
-- schema also proposes dropping Album_title_trgm_idx, Artist_username_trgm_idx,
-- Playlist_title_trgm_idx and Track_title_trgm_idx (raw-SQL GIN trigram indexes Prisma cannot
-- express) — this file intentionally contains none of those DROPs. Verify with
-- `rg 'DROP INDEX' <this file>` before trusting it, and confirm the chain still applies from
-- empty against a throwaway database per api-rules.md before merging.

-- CreateIndex
CREATE INDEX "ListeningHistory_listenedAt_idx" ON "ListeningHistory"("listenedAt");
