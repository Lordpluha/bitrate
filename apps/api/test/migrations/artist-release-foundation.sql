-- Run only against an isolated database with the release migration applied.
-- ON_ERROR_STOP makes unexpected constraint behavior fail the verification command.
BEGIN;

INSERT INTO "Artist" ("id", "username", "email")
VALUES ('00000000-0000-4000-8000-000000000001', 'migration-owner', 'owner@example.test');

INSERT INTO "Track" ("id", "title", "audioUrl", "artistId")
VALUES ('00000000-0000-4000-8000-000000000002', 'Existing recording', '/fixture.mp3', '00000000-0000-4000-8000-000000000001');

INSERT INTO "Release" ("id", "ownerArtistId", "title", "upc") VALUES
('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'First draft', '012345678905'),
('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Other draft', NULL);

INSERT INTO "ReleaseContributor" ("id", "releaseId", "displayName", "roles") VALUES
('00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003', 'Performer', ARRAY['PERFORMER']::"ReleaseCreditRole"[]),
('00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', 'Producer', ARRAY['PRODUCER']::"ReleaseCreditRole"[]);

INSERT INTO "ReleaseSplit" ("releaseId", "contributorId", "rightType", "shareBasisPoints") VALUES
('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000005', 'RECORDING', 7500),
('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000006', 'RECORDING', 2500);

INSERT INTO "ReleaseTrack" ("releaseId", "trackId", "position")
VALUES ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 0);
INSERT INTO "ReleaseTerritory" ("releaseId", "countryCode")
VALUES ('00000000-0000-4000-8000-000000000003', 'UA');

DO $$
BEGIN
  BEGIN
    INSERT INTO "ReleaseSplit" VALUES ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000005', 'RECORDING', 10000);
    RAISE EXCEPTION 'Cross-release contributor reference was allowed';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    UPDATE "ReleaseSplit" SET "shareBasisPoints" = 10001;
    RAISE EXCEPTION 'Share above 100 percent was allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE "ReleaseSplit" SET "shareBasisPoints" = 0;
    RAISE EXCEPTION 'Zero share was allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE "ReleaseTrack" SET "position" = -1;
    RAISE EXCEPTION 'Negative position was allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE "ReleaseContributor" SET "roles" = ARRAY[]::"ReleaseCreditRole"[];
    RAISE EXCEPTION 'A contributor without a credit role was allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE "ReleaseContributor" SET "roles" = NULL;
    RAISE EXCEPTION 'Null credit roles were allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO "ReleaseTerritory" VALUES ('00000000-0000-4000-8000-000000000003', 'u1');
    RAISE EXCEPTION 'Invalid territory syntax was allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    UPDATE "Release" SET "upc" = '012345678905' WHERE "id" = '00000000-0000-4000-8000-000000000004';
    RAISE EXCEPTION 'Duplicate UPC was allowed';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  DELETE FROM "Release" WHERE "id" = '00000000-0000-4000-8000-000000000003';
  IF EXISTS (SELECT 1 FROM "ReleaseSplit") OR EXISTS (SELECT 1 FROM "ReleaseContributor") OR EXISTS (SELECT 1 FROM "ReleaseTrack") OR EXISTS (SELECT 1 FROM "ReleaseTerritory") THEN
    RAISE EXCEPTION 'Release deletion left child records';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "Track" WHERE "id" = '00000000-0000-4000-8000-000000000002') THEN
    RAISE EXCEPTION 'Release deletion removed an existing recording';
  END IF;
END $$;

ROLLBACK;
