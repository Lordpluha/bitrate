-- Bitrate is music-only (ADR-0066): remove the podcast vertical and everything that points at it.

-- Reports naming a podcast or an episode would resolve to nothing once the tables are gone.
DELETE FROM "ModerationReport" WHERE lower("entityType") IN ('podcast', 'episode');

-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_podcastId_fkey";

-- DropForeignKey
ALTER TABLE "UserSavedEpisode" DROP CONSTRAINT "UserSavedEpisode_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSavedEpisode" DROP CONSTRAINT "UserSavedEpisode_episodeId_fkey";

-- DropTable
DROP TABLE "Podcast";

-- DropTable
DROP TABLE "Episode";

-- DropTable
DROP TABLE "UserSavedEpisode";
