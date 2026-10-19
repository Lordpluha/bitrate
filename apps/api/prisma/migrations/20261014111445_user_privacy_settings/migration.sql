-- Privacy settings the player shows (friend activity, follower lists, profile playlists).
-- Additive only. Prisma also generated DROPs of the four trigram search indexes and an unrelated
-- ArtistTrackDraft default; both were removed (see the api rules guide on migrations).
ALTER TABLE "UserSettings" ADD COLUMN     "followersVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicPlaylistsOnProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showListeningActivity" BOOLEAN NOT NULL DEFAULT true;
