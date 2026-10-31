-- Review feedback becomes one Markdown message. Fold the old required-change and
-- recommendation lists into it as bulleted sections, then drop the list columns.
UPDATE "ReleaseReview"
SET "message" = concat_ws(
    E'\n\n',
    NULLIF(btrim("message"), ''),
    CASE
        WHEN cardinality("requiredChanges") > 0 THEN
            E'**Required changes**\n' || (
                SELECT string_agg('- ' || item, E'\n' ORDER BY position)
                FROM unnest("requiredChanges") WITH ORDINALITY AS changes(item, position)
            )
    END,
    CASE
        WHEN cardinality("recommendations") > 0 THEN
            E'**Recommendations**\n' || (
                SELECT string_agg('- ' || item, E'\n' ORDER BY position)
                FROM unnest("recommendations") WITH ORDINALITY AS suggestions(item, position)
            )
    END
)
WHERE cardinality("requiredChanges") > 0 OR cardinality("recommendations") > 0;

-- AlterTable
ALTER TABLE "ReleaseReview" DROP COLUMN "recommendations",
DROP COLUMN "requiredChanges";
