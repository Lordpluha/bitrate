-- Older masters are compared from storage on demand; existing recordings stay untouched.
ALTER TABLE "ArtistTrackDraft" ADD COLUMN "audioSha256" CHAR(64);
