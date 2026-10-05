\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE music_demo_owner ON COMMIT DROP AS
SELECT id FROM "Artist" WHERE username = :'artist_username' AND "deletedAt" IS NULL;
DO $$ BEGIN
  IF (SELECT count(*) FROM music_demo_owner) <> 1 THEN
    RAISE EXCEPTION 'Expected one active artist; no demo data was written';
  END IF;
END $$;
SELECT pg_advisory_xact_lock(hashtext('artist-music-demo:' || id::text)) FROM music_demo_owner;

INSERT INTO "Release" (id, "ownerArtistId", title, type, status, cover, "isDemo", "createdAt", "updatedAt")
SELECT gen_random_uuid(), owner.id, sample.title, sample.type::"AlbumType", sample.status::"ReleaseStatus",
  sample.cover, true, now() - interval '1 month', now() - sample.age
FROM music_demo_owner owner
CROSS JOIN (VALUES
  ('Afterglow', 'EP', 'REJECTED', '/demo/music/album-afterglow.webp', interval '1 day'),
  ('Echoes EP', 'EP', 'RELEASED', '/demo/music/album-echoes-in-motion.webp', interval '36 days')
) AS sample(title, type, status, cover, age)
WHERE NOT EXISTS (SELECT 1 FROM "Release" r WHERE r."ownerArtistId" = owner.id AND r.title = sample.title AND r."isDemo");

INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", "releaseId", title, version, status, duration, cover, "previewUrl", "isDemo", "createdAt", "updatedAt")
SELECT gen_random_uuid(), owner.id,
  (SELECT id FROM "Release" WHERE "ownerArtistId" = owner.id AND title = sample.release_title AND "isDemo" LIMIT 1),
  sample.title, sample.version::"ArtistTrackVersion", sample.status::"ArtistTrackStatus", sample.duration,
  CASE WHEN sample.artwork IS NULL THEN NULL ELSE '/demo/music/' || sample.artwork END,
  CASE WHEN sample.status IN ('READY', 'NEEDS_CHANGES', 'PUBLISHED') THEN '/demo/music/preview.wav' ELSE NULL END,
  true, now() - interval '2 months', now() - sample.age
FROM music_demo_owner owner
CROSS JOIN (VALUES
  ('Night Signal', 'ORIGINAL', 'READY', 236, 'album-night-signal.webp', NULL, interval '10 minutes'),
  ('Afterglow', 'REMASTER', 'NEEDS_CHANGES', 242, 'album-afterglow.webp', 'Afterglow', interval '1 day'),
  ('Static Lines', 'ORIGINAL', 'PROCESSING', 227, 'album-static-lines.webp', NULL, interval '2 days'),
  ('Drift Control', 'LIVE', 'DRAFT', 199, 'album-drift-control.webp', NULL, interval '30 days'),
  ('Echoes in Motion', 'ORIGINAL', 'PUBLISHED', 261, 'album-echoes-in-motion.webp', 'Echoes EP', interval '36 days'),
  ('Parallel Minds', 'DEMO', 'UPLOAD_FAILED', 268, NULL, NULL, interval '40 days')
) AS sample(title, version, status, duration, artwork, release_title, age)
WHERE NOT EXISTS (SELECT 1 FROM "ArtistTrackDraft" t WHERE t."ownerArtistId" = owner.id AND t.title = sample.title AND t."isDemo");
COMMIT;
