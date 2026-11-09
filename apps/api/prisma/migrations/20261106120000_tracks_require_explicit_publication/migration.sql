-- Conversion readiness is not permission to publish. Existing catalogue visibility is preserved.
ALTER TABLE "Track" ALTER COLUMN "publishedAt" DROP DEFAULT;
