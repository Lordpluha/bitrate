# Recommendation system: behavior and implementation

Canonical specification. Tracked in [#518](https://github.com/Lordpluha/bitrate/issues/518),
which links here and carries no second copy.

## Goal and boundaries

Give each listener personal, explainable recommendations built from how they actually listen,
and give new and emerging artists a fair way in.

Today "Made For You" is the most popular tracks of the listener's five most-played genres
(`DiscoveryService.getFeed`). "Related artists" means artists sharing a genre, ordered by monthly
listeners. A play is logged only as "started" (`ListeningHistory`), so a track skipped after
three seconds counts the same as one played to the end.

**Surfaces (v1):**

1. Home "Made For You": personal tracks, releases and artists.
2. Similar tracks and artists ("Fans also like"), based on listening behaviour, not genre.
3. Autoplay and radio: playback continues after the queue ends (`UserSettings.autoplay`), and
   a station can be started from a track or an artist.
4. Generated playlists: a weekly discovery mix and several daily mixes.
5. Mood: a 2D mood pad tile on the home bento, from cold to hot (valence) and calm to energetic
   (energy). It re-ranks its own track list live; the rest of home stays stable.

**Affected workspaces:** `apps/api` (signals, jobs, serving), new `apps/ml` (offline Python
worker), `packages/player` (playback events), `apps/web-player` (surfaces and feedback),
`apps/admin` (tuning tile, metrics), `apps/web-artists` (recommendation source stats),
`infra` (pgvector image), `pencil/` and prototypes (every new screen and state).

**Out of scope:** podcasts and spoken word (ADR-0066); a separate vector database (ADR-0071); a
Python HTTP service: the worker never serves requests; real-time model training.

## Observable behavior and contracts

### Signals

- The player reports a playback event when a play ends, is skipped or is stopped
  (`POST /me/playback-events`). Each event carries a client play id, the track, start and end
  times, listened milliseconds, how it ended (`COMPLETED | SKIPPED | STOPPED`) and the source:
  `PLAYLIST | ALBUM | ARTIST | SEARCH | LIBRARY | HOME | CHART | HISTORY | RADIO | AUTOPLAY |
  MOOD | GENERATED_PLAYLIST | JAM | OTHER`, with the context id where it has one. The duration
  comes from the catalogue, not the client. A retried report with the same play id is stored
  once. A report that ends more than 5 minutes in the future or started over 7 days ago is
  refused.
- Listening history is unchanged: it is still recorded when a play starts and feeds history,
  charts, counts and friend activity. Events are a separate, richer signal.
- Events go to an append-only table (`PlaybackEvent`). Raw events are kept for 13 calendar
  months; a daily job deletes older ones in batches. Per-user and per-track aggregates and
  trained vectors stay. Not partitioned: Prisma reads partitions as drift and would generate
  migrations dropping them, and batched deletes suffice at this scale.
- Taste weight, fixed when the event is stored: 1 for a play the listener chose; 0.5 for plays
  the system chose (radio, autoplay, mood, generated mixes) and for Jam tracks someone else
  queued. During a private session nothing is stored at all, as with listening history. A skip
  within the first 30 s is a negative signal (applied when signals are read, stage 2).
- Explicit feedback: "Not interested" on a track or an artist hides it from every recommendation
  surface for that listener (today: "Made For You"). "Don't use for my taste" on a playlist, an
  album or a track removes plays of it, or started from it, from the taste profile; it applies
  when signals are read, so it also covers past plays and can be undone. Likes and follows keep
  their current meaning as positive signals.
- Impressions (what was shown, on which surface, at which position, with which reason) and the
  resulting actions (played, saved, skipped, "Not interested") are logged. This lands with the
  serving module in stage 2, which issues the id of each served list.

### Serving

- One `recommendations` module in the API serves every surface. It gathers candidates from
  several sources: co-listening neighbours, vector nearest neighbours, followed artists,
  friends' listening, fresh tracks and popular tracks. It then filters, ranks, diversifies and
  caches the result in Redis.
- Filters that always apply: published and not moderation-blocked, not deleted, the listener's
  explicit-content setting, "Not interested", and recently played (per surface).
- Diversity: a per-artist cap per list, plus maximal-marginal-relevance re-ranking.
- Exploration: about 15 % of recommended slots go to fresh tracks and tracks by artists with few
  listeners. The share is tunable in admin.
- Every recommended item carries a reason shown as "Why this?", for example "Because you
  listened to X", "Friends like this", "New from an artist you follow" or "Fresh pick".
- Cold start, listener: an onboarding taste picker (genres and artists) after sign-up, then
  popular tracks in the listener's language and region plus friends' listening until enough
  history exists.
- Cold start, track: audio features computed at publish time make a new track matchable before
  it has any plays.
- Mood: the mood pad maps to a target point (valence, energy). Candidates are ranked by
  distance to that point together with personal relevance.
- Generated playlists are regenerated on a schedule (weekly mix once a week, daily mixes once a
  day) and are ordinary read-only playlists owned by the system.

### Offline worker (`apps/ml`)

- A Python worker consumes BullMQ jobs and exposes no HTTP.
- `analyze-audio` runs after a track is published. It stores an audio embedding plus
  `energy`, `valence`, `bpm` and `danceability`. A backfill covers the existing catalogue.
- `train-cf` runs nightly. It trains implicit-feedback matrix factorisation on playback events
  and stores user and track vectors.
- Only models whose licences allow commercial use. Many ready-made mood models, for example
  Essentia's, are CC BY-NC-ND and are excluded.
- It runs as its own container: CPU inference, concurrency 1, memory-bounded.

### Storage

PostgreSQL with pgvector holds events, aggregates, similarity tables, audio features and
vectors (ADR-0071). Redis holds cached recommendation lists, queues and per-session radio state.

### Admin and artists

- An admin bento tile adjusts source weights, the exploration share and the artist cap. Each
  change is versioned and audited. It also shows CTR and save rate per surface.
- Artists see how many listeners reached them through recommendations, radio, mood and
  generated playlists.

### Privacy

Playback events are personal data. Account deletion cascades to them. A listener can see and
reset their taste profile (planned for stage 6). The worker never receives more than track ids,
audio files and anonymous user ids.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | Every environment's database has the `vector` extension; existing volumes keep valid indexes | Image built and smoke-tested locally and in `postgres_image.yml`; an alpine-initialised volume attached to the new image passed `bt_index_check`; all migrations applied through the CI compose step | Stage 0 — done; CI green on #519 |
| AC-2 | The player reports listened ms, completion or skip, and source context for every play | Integration test on the events endpoint; player unit test | API side: `recommendations.controller.int-spec.ts`, `playback-events.service.unit-spec.ts`. Player reporting pending |
| AC-3 | Private-session plays never reach the taste profile; Jam and system-chosen plays are down-weighted | Unit tests of the weighting | `taste-weight.unit-spec.ts`, `playback-events.service.unit-spec.ts` |
| AC-4 | "Not interested" hides the item from every surface; "Don't use for my taste" removes it from the profile | API integration tests across surfaces | API and "Made For You": `taste.service.unit-spec.ts`, `discovery.service.unit-spec.ts`. Exclusions take effect when stage 2 reads signals; web-player UI pending |
| AC-5 | "Made For You", similar tracks and artists, and radio/autoplay come from co-listening, not genre overlap, and never return filtered items | Integration tests on seeded listening data | Pending |
| AC-6 | About 15 % of slots are exploration; no artist exceeds the cap in a list | Unit tests on the ranker | Pending |
| AC-7 | Every recommended item has a reason the UI can show as "Why this?" | Contract check plus web-player test | Pending |
| AC-8 | A new listener goes through the taste picker and gets non-empty recommendations immediately | e2e test | Pending |
| AC-9 | A newly published track gets audio features and appears among similar tracks without plays | Worker test plus integration test | Pending |
| AC-10 | The mood pad re-ranks its tile by (valence, energy) with all screen states | web-player tests; Pencil and prototype in sync | Pending |
| AC-11 | Weekly and daily mixes regenerate on schedule | Job tests | Pending |
| AC-12 | Impressions and actions are logged; admin shows CTR and save rate and can change weights | Integration plus admin tests | Pending |
| AC-13 | Artists see listeners reached through recommendation sources | web-artists test | Pending |
| AC-14 | Raw events older than 13 months are removed; aggregates stay | Retention job test | `playback-events.service.unit-spec.ts`, `playback-events-retention.consumer.unit-spec.ts` (no aggregates exist before stage 2) |

## Decisions and approval

All decisions below were confirmed by the project owner in the planning interview on
2026-11-10, and the plan was approved the same day ("План ок").

- Surfaces: all five listed above, including the 2D mood pad as its own home tile.
- Rich playback events: yes. Retention: 13 months raw, then aggregates.
- Engine: hybrid. NestJS serves from Postgres with pgvector; an offline Python worker
  (`apps/ml`, BullMQ, no HTTP) does audio analysis and collaborative-filtering training.
- Database: the existing PostgreSQL with pgvector plus Redis; no new datastore (ADR-0071).
- Cold start: taste picker, popular plus friends, audio features, about 15 % exploration
  (admin-tunable).
- Feedback: "Not interested", "Don't use for my taste", "Why this?".
- Taste input: private session excluded; Jam and system-chosen plays down-weighted.
- Operations: impression and action logging, admin tuning tile, artist source stats. A/B
  testing comes later.

Open before the stages that need them:

- Which commercially licensed audio model the worker uses (stage 3).
- Whether the production database's application role is a superuser. If it is not, an
  administrator runs `CREATE EXTENSION vector;` once before the stage-0 deploy.

## Implementation plan

Each stage lands as its own PR chain (one workspace per PR, producer first).

0. **Infrastructure** (AC-1): `infra/postgres` image (alpine + pgvector 0.8.7) in dev,
   CI and prod; `postgres_image.yml`; migration `enable_pgvector`; ADR-0071.
1. **Signals** (AC-2, AC-3, AC-4, AC-14): `PlaybackEvent`, `NotInterested` and
   `TasteExclusion` with their endpoints, "Not interested" applied to "Made For You", and the
   retention job (api, with #519); then player reporting (player); then the "Not interested"
   and "Don't use for my taste" UI (web-player).
2. **Co-listening v1** (AC-5, AC-6, AC-7, AC-8, AC-12 logging): nightly BullMQ job building
   track similarity; serving in the `recommendations` module with candidates, filters (including
   taste exclusions and early skips), ranker, diversity, exploration and reasons; impression and
   action logging; taste picker; replaces the genre-based feed and related artists.
3. **Audio analysis** (AC-9): `apps/ml` worker, `analyze-audio` after publish, backfill, audio
   similarity as a candidate source.
4. **Mood and generated playlists** (AC-10, AC-11): mood features in ranking, the mood pad
   tile, weekly and daily mixes.
5. **Matrix factorisation**: nightly `train-cf` in `apps/ml`; vectors as a candidate source and
   a ranking feature.
6. **Admin and artists** (AC-12, AC-13): tuning tile with metrics; artist source statistics;
   taste-profile view and reset for listeners.

Every UI piece is drawn in Pencil from design-system components and kept in sync with the
prototypes, with all states (default, loading, empty, error and screen-specific ones). The UI
pieces are the mood tile, taste picker, "Why this?", "Not interested", admin tile and artist
stats.
