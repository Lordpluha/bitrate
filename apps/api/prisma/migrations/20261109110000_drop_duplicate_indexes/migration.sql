-- Each of these duplicates a unique index on the same column (or a unique key with the same
-- leading column). The planner already uses the unique index, so the copies only cost storage
-- and an extra write on every insert or token rotation.
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_username_idx";
DROP INDEX IF EXISTS "UserSession_access_token_idx";
DROP INDEX IF EXISTS "UserSession_refresh_token_idx";
DROP INDEX IF EXISTS "Staff_email_idx";
DROP INDEX IF EXISTS "StaffSession_access_token_idx";
DROP INDEX IF EXISTS "StaffSession_refresh_token_idx";
DROP INDEX IF EXISTS "Artist_email_idx";
DROP INDEX IF EXISTS "Artist_username_idx";
DROP INDEX IF EXISTS "ArtistSession_access_token_idx";
DROP INDEX IF EXISTS "ArtistSession_refresh_token_idx";
DROP INDEX IF EXISTS "TrackFile_trackId_idx";

-- Artist analytics filter history by track and period and count distinct listeners. With only
-- (trackId) every play of the artist's tracks is fetched from the heap and filtered by date;
-- (trackId, listenedAt, userId) range-scans the period and allows index-only scans.
DROP INDEX IF EXISTS "ListeningHistory_trackId_idx";
CREATE INDEX "ListeningHistory_trackId_listenedAt_userId_idx"
  ON "ListeningHistory"("trackId", "listenedAt", "userId");
