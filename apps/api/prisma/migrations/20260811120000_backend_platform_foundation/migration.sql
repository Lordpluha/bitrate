-- This migration replaces relationship tables and must never leave the schema
-- half-contracted if a late backfill/index/permission step fails.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '15min';

-- Fail before taking destructive locks when the deployment role cannot install
-- the extension required by the indexes created below.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "AlbumType" AS ENUM ('ALBUM', 'SINGLE', 'EP', 'COMPILATION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_RELEASE', 'PLAYLIST_UPDATE', 'FOLLOW', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM_INDIVIDUAL', 'PREMIUM_DUO', 'PREMIUM_FAMILY', 'PREMIUM_STUDENT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_artistId_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedTracks" DROP CONSTRAINT "_UserLikedTracks_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedTracks" DROP CONSTRAINT "_UserLikedTracks_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedArtists" DROP CONSTRAINT "_UserLikedArtists_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedArtists" DROP CONSTRAINT "_UserLikedArtists_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollowedArtists" DROP CONSTRAINT "_UserFollowedArtists_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFollowedArtists" DROP CONSTRAINT "_UserFollowedArtists_B_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumToTrack" DROP CONSTRAINT "_AlbumToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_AlbumToTrack" DROP CONSTRAINT "_AlbumToTrack_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedAlbums" DROP CONSTRAINT "_UserLikedAlbums_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedAlbums" DROP CONSTRAINT "_UserLikedAlbums_B_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToTrack" DROP CONSTRAINT "_PlaylistToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToTrack" DROP CONSTRAINT "_PlaylistToTrack_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedPlaylists" DROP CONSTRAINT "_UserLikedPlaylists_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserLikedPlaylists" DROP CONSTRAINT "_UserLikedPlaylists_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- Accounts created before email verification existed remain usable.
UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "emailVerifiedAt" IS NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "discNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "explicit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isrc" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "trackNumber" INTEGER;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "country" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "monthlyListeners" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socials" JSONB,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Artist" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "emailVerifiedAt" IS NULL;

-- Sessions created before persisted expiry was enforced used NULL. Backfill them
-- with the documented default refresh-token lifetime; JWT verification still
-- rejects any token whose embedded expiry is earlier than this timestamp.
UPDATE "UserSession"
SET "expiresAt" = "createdAt" + INTERVAL '30 days'
WHERE "expiresAt" IS NULL;

UPDATE "ArtistSession"
SET "expiresAt" = "createdAt" + INTERVAL '30 days'
WHERE "expiresAt" IS NULL;

ALTER TABLE "UserSession" ALTER COLUMN "expiresAt" SET NOT NULL;
ALTER TABLE "ArtistSession" ALTER COLUMN "expiresAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "copyright" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "label" TEXT,
ADD COLUMN     "totalTracks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "AlbumType" NOT NULL DEFAULT 'ALBUM';

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "collaborative" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserEmailVerification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistEmailVerification" (
    "id" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtistEmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "id" UUID NOT NULL,
    "playlistId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" UUID,

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumTrack" (
    "id" UUID NOT NULL,
    "albumId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "discNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AlbumTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLikedTrack" (
    "userId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLikedTrack_pkey" PRIMARY KEY ("userId","trackId")
);

-- CreateTable
CREATE TABLE "UserLikedAlbum" (
    "userId" UUID NOT NULL,
    "albumId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLikedAlbum_pkey" PRIMARY KEY ("userId","albumId")
);

-- CreateTable
CREATE TABLE "UserLikedPlaylist" (
    "userId" UUID NOT NULL,
    "playlistId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLikedPlaylist_pkey" PRIMARY KEY ("userId","playlistId")
);

-- CreateTable
CREATE TABLE "UserLikedArtist" (
    "userId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLikedArtist_pkey" PRIMARY KEY ("userId","artistId")
);

-- CreateTable
CREATE TABLE "UserFollowedArtist" (
    "userId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollowedArtist_pkey" PRIMARY KEY ("userId","artistId")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "followerId" UUID NOT NULL,
    "followingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "cover" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackGenre" (
    "trackId" UUID NOT NULL,
    "genreId" UUID NOT NULL,

    CONSTRAINT "TrackGenre_pkey" PRIMARY KEY ("trackId","genreId")
);

-- CreateTable
CREATE TABLE "AlbumGenre" (
    "albumId" UUID NOT NULL,
    "genreId" UUID NOT NULL,

    CONSTRAINT "AlbumGenre_pkey" PRIMARY KEY ("albumId","genreId")
);

-- CreateTable
CREATE TABLE "ArtistGenre" (
    "artistId" UUID NOT NULL,
    "genreId" UUID NOT NULL,

    CONSTRAINT "ArtistGenre_pkey" PRIMARY KEY ("artistId","genreId")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" UUID NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "streamingQuality" TEXT NOT NULL DEFAULT 'automatic',
    "normalizeVolume" BOOLEAN NOT NULL DEFAULT true,
    "compactLibrary" BOOLEAN NOT NULL DEFAULT false,
    "showNowPlaying" BOOLEAN NOT NULL DEFAULT true,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "explicitContent" BOOLEAN NOT NULL DEFAULT true,
    "privateSession" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" UUID,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerState" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID,
    "currentTrackId" UUID,
    "contextType" TEXT,
    "contextId" UUID,
    "positionMs" INTEGER NOT NULL DEFAULT 0,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "repeatMode" TEXT NOT NULL DEFAULT 'off',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQueueItem" (
    "id" UUID NOT NULL,
    "playerStateId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Podcast" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "language" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" UUID NOT NULL,
    "podcastId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audioUrl" TEXT NOT NULL,
    "cover" TEXT,
    "duration" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedEpisode" (
    "userId" UUID NOT NULL,
    "episodeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSavedEpisode_pkey" PRIMARY KEY ("userId","episodeId")
);

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmailVerification_token_key" ON "UserEmailVerification"("token");

-- CreateIndex
CREATE INDEX "UserEmailVerification_userId_idx" ON "UserEmailVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistEmailVerification_token_key" ON "ArtistEmailVerification"("token");

-- CreateIndex
CREATE INDEX "ArtistEmailVerification_artistId_idx" ON "ArtistEmailVerification"("artistId");

-- CreateIndex
CREATE INDEX "PlaylistTrack_playlistId_addedAt_idx" ON "PlaylistTrack"("playlistId", "addedAt" DESC);

-- CreateIndex
CREATE INDEX "PlaylistTrack_trackId_idx" ON "PlaylistTrack"("trackId");

-- CreateIndex
CREATE INDEX "PlaylistTrack_addedById_idx" ON "PlaylistTrack"("addedById");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_position_key" ON "PlaylistTrack"("playlistId", "position");

-- CreateIndex
CREATE INDEX "AlbumTrack_trackId_idx" ON "AlbumTrack"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumTrack_albumId_trackId_key" ON "AlbumTrack"("albumId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumTrack_albumId_discNumber_trackNumber_key" ON "AlbumTrack"("albumId", "discNumber", "trackNumber");

-- CreateIndex
CREATE INDEX "UserLikedTrack_userId_createdAt_idx" ON "UserLikedTrack"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserLikedTrack_trackId_idx" ON "UserLikedTrack"("trackId");

-- CreateIndex
CREATE INDEX "UserLikedAlbum_userId_createdAt_idx" ON "UserLikedAlbum"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserLikedAlbum_albumId_idx" ON "UserLikedAlbum"("albumId");

-- CreateIndex
CREATE INDEX "UserLikedPlaylist_userId_createdAt_idx" ON "UserLikedPlaylist"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserLikedPlaylist_playlistId_idx" ON "UserLikedPlaylist"("playlistId");

-- CreateIndex
CREATE INDEX "UserLikedArtist_userId_createdAt_idx" ON "UserLikedArtist"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserLikedArtist_artistId_idx" ON "UserLikedArtist"("artistId");

-- CreateIndex
CREATE INDEX "UserFollowedArtist_userId_createdAt_idx" ON "UserFollowedArtist"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserFollowedArtist_artistId_idx" ON "UserFollowedArtist"("artistId");

-- CreateIndex
CREATE INDEX "UserFollow_followingId_createdAt_idx" ON "UserFollow"("followingId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TrackArtist_artistId_idx" ON "TrackArtist"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackArtist_trackId_position_key" ON "TrackArtist"("trackId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "TrackGenre_genreId_idx" ON "TrackGenre"("genreId");

-- CreateIndex
CREATE INDEX "AlbumGenre_genreId_idx" ON "AlbumGenre"("genreId");

-- CreateIndex
CREATE INDEX "ArtistGenre_genreId_idx" ON "ArtistGenre"("genreId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_searchedAt_idx" ON "SearchHistory"("userId", "searchedAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "PlayerDevice_userId_lastSeenAt_idx" ON "PlayerDevice"("userId", "lastSeenAt" DESC);

-- Enforce the invariant even when multiple API replicas activate devices concurrently.
CREATE UNIQUE INDEX "PlayerDevice_one_active_per_user_idx" ON "PlayerDevice"("userId") WHERE "isActive" = true;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerState_userId_key" ON "PlayerState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerState_deviceId_key" ON "PlayerState"("deviceId");

-- CreateIndex
CREATE INDEX "PlayerState_currentTrackId_idx" ON "PlayerState"("currentTrackId");

-- CreateIndex
CREATE INDEX "PlayerQueueItem_trackId_idx" ON "PlayerQueueItem"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerQueueItem_playerStateId_position_key" ON "PlayerQueueItem"("playerStateId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerSubscriptionId_key" ON "Subscription"("providerSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Podcast_title_idx" ON "Podcast"("title");

-- CreateIndex
CREATE INDEX "Podcast_deletedAt_idx" ON "Podcast"("deletedAt");

-- CreateIndex
CREATE INDEX "Episode_podcastId_releaseDate_idx" ON "Episode"("podcastId", "releaseDate" DESC);

-- CreateIndex
CREATE INDEX "Episode_title_idx" ON "Episode"("title");

-- CreateIndex
CREATE INDEX "Episode_deletedAt_idx" ON "Episode"("deletedAt");

-- CreateIndex
CREATE INDEX "UserSavedEpisode_userId_createdAt_idx" ON "UserSavedEpisode"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserSavedEpisode_episodeId_idx" ON "UserSavedEpisode"("episodeId");

-- CreateIndex
CREATE INDEX "ModerationReport_status_createdAt_idx" ON "ModerationReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationReport_entityType_entityId_idx" ON "ModerationReport"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_isrc_key" ON "Track"("isrc");

-- CreateIndex
CREATE INDEX "Track_popularity_idx" ON "Track"("popularity" DESC);

-- CreateIndex
CREATE INDEX "Track_playCount_idx" ON "Track"("playCount" DESC);

-- CreateIndex
CREATE INDEX "Track_deletedAt_idx" ON "Track"("deletedAt");

-- CreateIndex
CREATE INDEX "Artist_monthlyListeners_idx" ON "Artist"("monthlyListeners" DESC);

-- CreateIndex
CREATE INDEX "Artist_deletedAt_idx" ON "Artist"("deletedAt");

-- CreateIndex
CREATE INDEX "Album_deletedAt_idx" ON "Album"("deletedAt");

-- CreateIndex
CREATE INDEX "Playlist_deletedAt_idx" ON "Playlist"("deletedAt");

-- AddForeignKey
ALTER TABLE "UserEmailVerification" ADD CONSTRAINT "UserEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistEmailVerification" ADD CONSTRAINT "ArtistEmailVerification_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumTrack" ADD CONSTRAINT "AlbumTrack_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumTrack" ADD CONSTRAINT "AlbumTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedTrack" ADD CONSTRAINT "UserLikedTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedTrack" ADD CONSTRAINT "UserLikedTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedAlbum" ADD CONSTRAINT "UserLikedAlbum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedAlbum" ADD CONSTRAINT "UserLikedAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedPlaylist" ADD CONSTRAINT "UserLikedPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedPlaylist" ADD CONSTRAINT "UserLikedPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedArtist" ADD CONSTRAINT "UserLikedArtist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikedArtist" ADD CONSTRAINT "UserLikedArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowedArtist" ADD CONSTRAINT "UserFollowedArtist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollowedArtist" ADD CONSTRAINT "UserFollowedArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackGenre" ADD CONSTRAINT "TrackGenre_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackGenre" ADD CONSTRAINT "TrackGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumGenre" ADD CONSTRAINT "AlbumGenre_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumGenre" ADD CONSTRAINT "AlbumGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistGenre" ADD CONSTRAINT "ArtistGenre_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistGenre" ADD CONSTRAINT "ArtistGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDevice" ADD CONSTRAINT "PlayerDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerState" ADD CONSTRAINT "PlayerState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerState" ADD CONSTRAINT "PlayerState_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PlayerDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerState" ADD CONSTRAINT "PlayerState_currentTrackId_fkey" FOREIGN KEY ("currentTrackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQueueItem" ADD CONSTRAINT "PlayerQueueItem_playerStateId_fkey" FOREIGN KEY ("playerStateId") REFERENCES "PlayerState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQueueItem" ADD CONSTRAINT "PlayerQueueItem_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedEpisode" ADD CONSTRAINT "UserSavedEpisode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedEpisode" ADD CONSTRAINT "UserSavedEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve data from Prisma's previous implicit many-to-many tables.
INSERT INTO "PlaylistTrack" ("id", "playlistId", "trackId", "position", "addedAt", "addedById")
SELECT gen_random_uuid(), old."A", old."B",
       ROW_NUMBER() OVER (PARTITION BY old."A" ORDER BY old."B") - 1,
       CURRENT_TIMESTAMP, playlist."userId"
FROM "_PlaylistToTrack" old
JOIN "Playlist" playlist ON playlist."id" = old."A";

INSERT INTO "AlbumTrack" ("id", "albumId", "trackId", "trackNumber", "discNumber")
SELECT gen_random_uuid(), old."A", old."B",
       ROW_NUMBER() OVER (PARTITION BY old."A" ORDER BY track."releaseDate", old."B"), 1
FROM "_AlbumToTrack" old
JOIN "Track" track ON track."id" = old."B";

INSERT INTO "UserLikedTrack" ("userId", "trackId", "createdAt")
SELECT "B", "A", CURRENT_TIMESTAMP FROM "_UserLikedTracks";

INSERT INTO "UserLikedAlbum" ("userId", "albumId", "createdAt")
SELECT "B", "A", CURRENT_TIMESTAMP FROM "_UserLikedAlbums";

INSERT INTO "UserLikedPlaylist" ("userId", "playlistId", "createdAt")
SELECT "B", "A", CURRENT_TIMESTAMP FROM "_UserLikedPlaylists";

INSERT INTO "UserLikedArtist" ("userId", "artistId", "createdAt")
SELECT "B", "A", CURRENT_TIMESTAMP FROM "_UserLikedArtists";

INSERT INTO "UserFollowedArtist" ("userId", "artistId", "createdAt")
SELECT "B", "A", CURRENT_TIMESTAMP FROM "_UserFollowedArtists";

INSERT INTO "TrackArtist" ("trackId", "artistId", "position", "isPrimary")
SELECT "id", "artistId", 0, true FROM "Track";

UPDATE "Album" album
SET "totalTracks" = (
  SELECT COUNT(*)::INTEGER FROM "AlbumTrack" album_track
  WHERE album_track."albumId" = album."id"
);

UPDATE "Playlist" playlist
SET "followersCount" = (
  SELECT COUNT(*)::INTEGER FROM "UserLikedPlaylist" liked
  WHERE liked."playlistId" = playlist."id"
);

CREATE INDEX "Track_title_trgm_idx" ON "Track" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Artist_username_trgm_idx" ON "Artist" USING GIN ("username" gin_trgm_ops);
CREATE INDEX "Album_title_trgm_idx" ON "Album" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Playlist_title_trgm_idx" ON "Playlist" USING GIN ("title" gin_trgm_ops);

-- Remove the implicit join tables only after the backfill succeeds.
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "_PlaylistToTrack") <> (SELECT COUNT(*) FROM "PlaylistTrack") THEN
    RAISE EXCEPTION 'PlaylistTrack backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_AlbumToTrack") <> (SELECT COUNT(*) FROM "AlbumTrack") THEN
    RAISE EXCEPTION 'AlbumTrack backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_UserLikedTracks") <> (SELECT COUNT(*) FROM "UserLikedTrack") THEN
    RAISE EXCEPTION 'UserLikedTrack backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_UserLikedAlbums") <> (SELECT COUNT(*) FROM "UserLikedAlbum") THEN
    RAISE EXCEPTION 'UserLikedAlbum backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_UserLikedPlaylists") <> (SELECT COUNT(*) FROM "UserLikedPlaylist") THEN
    RAISE EXCEPTION 'UserLikedPlaylist backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_UserLikedArtists") <> (SELECT COUNT(*) FROM "UserLikedArtist") THEN
    RAISE EXCEPTION 'UserLikedArtist backfill row-count mismatch';
  END IF;
  IF (SELECT COUNT(*) FROM "_UserFollowedArtists") <> (SELECT COUNT(*) FROM "UserFollowedArtist") THEN
    RAISE EXCEPTION 'UserFollowedArtist backfill row-count mismatch';
  END IF;
END $$;

DROP TABLE "_UserLikedTracks";
DROP TABLE "_UserLikedArtists";
DROP TABLE "_UserFollowedArtists";
DROP TABLE "_AlbumToTrack";
DROP TABLE "_UserLikedAlbums";
DROP TABLE "_PlaylistToTrack";
DROP TABLE "_UserLikedPlaylists";

COMMIT;
