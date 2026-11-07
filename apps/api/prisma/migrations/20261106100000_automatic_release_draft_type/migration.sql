-- Existing editable drafts follow the same recording-count rule as new uploads.
-- Reviewed and published metadata stays unchanged.
WITH formats AS (
  SELECT release."id",
    (CASE WHEN COUNT(recording."id") >= 7 THEN 'ALBUM'
          WHEN COUNT(recording."id") >= 5 THEN 'EP'
          ELSE 'SINGLE' END)::"AlbumType" AS "type"
  FROM "Release" AS release
  LEFT JOIN "ArtistTrackDraft" AS recording
    ON recording."releaseId" = release."id" AND recording."deletedAt" IS NULL
  WHERE release."status" = 'DRAFT' AND release."deletedAt" IS NULL
  GROUP BY release."id"
)
UPDATE "Release" AS release
SET "type" = formats."type", "updatedAt" = NOW()
FROM formats
WHERE release."id" = formats."id" AND release."type" <> formats."type";
