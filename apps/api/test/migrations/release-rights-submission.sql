\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  owner_id uuid := gen_random_uuid();
  release_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO "Artist" (id, username, email, "updatedAt")
    VALUES (owner_id, 'rights-qa-' || owner_id, owner_id || '@example.test', now());
  INSERT INTO "Release" (id, "ownerArtistId", title, "updatedAt")
    VALUES (release_id, owner_id, 'Rights QA', now());

  -- Identifier formats.
  UPDATE "Release" SET upc = '036000291452' WHERE id = release_id;
  BEGIN
    UPDATE "Release" SET upc = '03600029145A' WHERE id = release_id;
    RAISE EXCEPTION 'A non-numeric UPC was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", "releaseId", title, isrc, "updatedAt")
    VALUES (gen_random_uuid(), owner_id, release_id, 'Coded', 'USRC17607839', now());
  BEGIN
    INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", title, isrc, "updatedAt")
      VALUES (gen_random_uuid(), owner_id, 'Hyphenated', 'US-RC1-76-0783', now());
    RAISE EXCEPTION 'A hyphenated ISRC was stored';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO "ArtistTrackDraft" (id, "ownerArtistId", title, isrc, "updatedAt")
      VALUES (gen_random_uuid(), owner_id, 'Duplicate', 'USRC17607839', now());
    RAISE EXCEPTION 'A duplicate ISRC was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  -- Master owner: a name exactly when another party owns the master.
  UPDATE "Release" SET "masterOwnerType" = 'ARTIST' WHERE id = release_id;
  UPDATE "Release" SET "masterOwnerType" = 'OTHER', "masterOwnerName" = 'North Label'
    WHERE id = release_id;
  BEGIN
    UPDATE "Release" SET "masterOwnerName" = '  ' WHERE id = release_id;
    RAISE EXCEPTION 'A blank master owner name was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    UPDATE "Release" SET "masterOwnerType" = 'ARTIST', "masterOwnerName" = 'North Label'
      WHERE id = release_id;
    RAISE EXCEPTION 'A name was stored for an artist-owned master';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    UPDATE "Release" SET "masterOwnerType" = NULL, "masterOwnerName" = 'North Label'
      WHERE id = release_id;
    RAISE EXCEPTION 'A name was stored without an owner type';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
ROLLBACK;
