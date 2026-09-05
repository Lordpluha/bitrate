-- A UNIQUE index already serves equality lookups for each token. Keeping a
-- second single-column btree only increases write amplification and disk use.
DROP INDEX IF EXISTS "UserPasswordReset_token_idx";
DROP INDEX IF EXISTS "ArtistPasswordReset_token_idx";
DROP INDEX IF EXISTS "UserEmailVerification_token_idx";
DROP INDEX IF EXISTS "ArtistEmailVerification_token_idx";
