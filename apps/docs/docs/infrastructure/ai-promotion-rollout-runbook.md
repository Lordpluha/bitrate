# AI promotion rollout runbook

Staged rollout of AI artist promotion ([spec](../specs/ai-artist-promotion.md), plan step 10;
[ADR-0076](../architecture/0076-ai-provider-boundary.md)). The feature ships dark: nothing changes
for artists until both switches below are on.

| Switch | Where | Effect |
|---|---|---|
| `PROMOTION_AI_ENABLED` | GitHub `production` environment **variable** (`true`/`false`, default off) | The API builds its model routes at startup and fails fast if a routed provider has no key or no price |
| `Artist.promotionEnabled` | Database, per artist (default `false`) | Opens the Promotion stage, the Promotion page and the profile for that artist; every other artist gets 403 `errors.promotion.disabled` and sees "not available yet" |

Both must be on. The countdown tile on the player's artist page and the follower message in the
release notification also need the artist's flag.

## 1. Before the first artist

1. **Owner decisions still open** (spec, plan step 2):
   - switch on Mistral's training opt-out for the API key that goes into production;
   - add the enabled AI providers to the privacy policy's processor table (section 6), with the
     countries where they process data: Anthropic, PBC (USA, Standard Contractual Clauses) and,
     if the fallback is kept, Mistral AI (EU). The policy has three copies (`apps/docs` and both
     apps' `src/shared/legal/documents.ts`); change them together and bump the legal version.
2. **Eval** (plan step 3) is optional for an owner-only start but required before beta artists:
   it decides the model defaults. Its budget needs the owner's approval.
3. Set the production secrets and variables (Settings → Environments → `production`):

   | Name | Kind | Value |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | secret | Anthropic API key (shared with the support assistant) |
   | `MISTRAL_API_KEY` | secret | Mistral key with training opt-out; leave unset to run without the fallback only if the routes are changed to `PROMOTION_MODEL_*_FALLBACK=` |
   | `PROMOTION_AI_MONTHLY_LIMIT_USD` | variable | Optional; default `2` (Free plan ceiling, spec D-5.5) |
   | `PROMOTION_AI_ENABLED` | variable | `true` |

   The deploy workflow refuses `PROMOTION_AI_ENABLED=true` without `ANTHROPIC_API_KEY`, and
   renders the values into the server's `.env` (section "AI promotion").
4. Release as usual (develop → Cut Release PR → master). The migrations
   `20261124100000_ai_usage` … `20261124130000_promotion_regeneration_events` are additive.

## 2. Turn it on for one artist

On the server, from `~/bitrate`:

```bash
docker compose --env-file .env -f infra/docker-compose.prod.yaml exec postgres \
  sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

```sql
-- the owner's own artist account first
UPDATE "Artist" SET "promotionEnabled" = true WHERE username = '<artist-username>';
SELECT username, "promotionEnabled" FROM "Artist" WHERE "promotionEnabled";
```

The change takes effect on the artist's next request; no restart is needed.

## 3. Watch

- **Spend:** `SELECT "artistId", sum("costMicroUsd") / 1e6 AS usd FROM "AiUsage" WHERE "createdAt" >= date_trunc('month', now()) GROUP BY 1 ORDER BY 2 DESC;`
- **Failing models:** `SELECT model, outcome, count(*) FROM "AiUsage" WHERE "createdAt" > now() - interval '1 day' GROUP BY 1, 2;` — many `FAILED` means the provider is down (the fallback takes over); `REJECTED_UNGROUNDED` means the prompt or model invents facts.
- **Approval rate (Stage 5 gate):** `SELECT name, count(*) FROM "PromotionEvent" WHERE name LIKE 'promotion.step.%' GROUP BY 1;`
- Sentry project `api` for job failures of the `promotion` queue.

## 4. Beta artists

Repeat section 2 per artist once the owner's own plans look right and the eval has set the model
defaults. Keep the list small while every artist is on the Free ceiling.

## 5. Turn it off

- **One artist:** `UPDATE "Artist" SET "promotionEnabled" = false WHERE username = '<artist-username>';`
  Their plans and posts stay in the database and come back when the flag is set again.
- **Everyone:** set `PROMOTION_AI_ENABLED` to `false` and redeploy. No model is called; generation
  requests fail as unavailable and every artist sees "not available yet". No data is deleted.
