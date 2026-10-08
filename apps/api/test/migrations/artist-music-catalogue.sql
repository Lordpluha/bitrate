\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  release_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO "Artist" (id, username, email, "updatedAt") VALUES
    (owner_id, 'music-qa-' || owner_id, owner_id || '@example.test', now()),
    (other_id, 'music-qa-' || other_id, other_id || '@example.test', now());
  INSERT INTO "Release" (id, "ownerArtistId", title, "updatedAt")
    VALUES (release_id, owner_id, 'Music ownership QA', now());
  BEGIN
    INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", "releaseId", title, "updatedAt")
      VALUES (gen_random_uuid(), other_id, release_id, 'Foreign draft', now());
    RAISE EXCEPTION 'Cross-owner release attachment was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", title, duration, "updatedAt")
      VALUES (gen_random_uuid(), owner_id, 'Invalid duration', -1, now());
    RAISE EXCEPTION 'Negative duration was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", "releaseId", title, "updatedAt")
    VALUES (gen_random_uuid(), owner_id, release_id, 'Owned draft', now());
  RAISE NOTICE 'PASS: owned draft accepted; cross-owner attachment and negative duration rejected';
END $$;
ROLLBACK;
