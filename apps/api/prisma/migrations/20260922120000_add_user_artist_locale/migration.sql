-- Adds a stored locale to User and Artist, used to render transactional emails in the
-- recipient's own language regardless of the request that triggers them (e.g. a queued
-- password-reset job with no Accept-Language header at all).
ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "Artist" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
