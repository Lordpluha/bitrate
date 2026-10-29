-- Bitrate is music-only (ADR-0066): `podcasts:read|delete|restore` leave the permission
-- catalogue together with the operator podcast endpoints, so no stored grant may keep them.
UPDATE "Role"
SET "permissions" = ARRAY(SELECT p FROM unnest("permissions") AS p WHERE p NOT LIKE 'podcasts:%')
WHERE EXISTS (SELECT 1 FROM unnest("permissions") AS p WHERE p LIKE 'podcasts:%');

UPDATE "Staff"
SET "permissions" = ARRAY(SELECT p FROM unnest("permissions") AS p WHERE p NOT LIKE 'podcasts:%')
WHERE EXISTS (SELECT 1 FROM unnest("permissions") AS p WHERE p LIKE 'podcasts:%');
