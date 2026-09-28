---
sidebar_position: 1
---

# Roadmap

> Last updated: September 28, 2026

Each `vX.Y.Z-slug` section mirrors a GitHub milestone. The version number names a theme, not a
release order: `v0.6.0` (artist dashboard) is scheduled ahead of `v0.5.0` (mobile), which waits
for the Player V2 redesign. Milestone due dates on GitHub are the schedule; this page is the scope.
Whether a milestone belongs on the roadmap at all is decided in
[Tech roadmap](../strategy/tech-roadmap.md).

---

## v0.1.0-setup
- [x] Turborepo monorepo setup
- [x] Apps initialization (API, Web, Mobile, Desktop, Admin, Docs)
- [x] Packages setup (ui-react, contracts, tokens)
- [x] Docker infrastructure
- [x] CI/CD pipelines (GitHub Actions)
- [x] Biome, Lefthook, Commitlint configuration
- [x] Database setup (PostgreSQL, Prisma)

---

## v0.2.0-auth-core
- [x] JWT authentication (access + refresh tokens)
- [x] User registration & login
- [x] Artist registration & login
- [x] Protected routes & RBAC
- [x] OAuth 2.0 — Google & Facebook (users + artists)
- [x] Two-Factor Authentication — TOTP, QR code, backup codes
- [x] Password recovery — email flow with reset tokens

---

## v0.3.0-music-engine
- [x] Audio upload & processing pipeline (BullMQ)
- [x] HLS streaming (128 / 192 / 320 kbps Opus)
- [x] Track & Album CRUD
- [x] File storage (static serving)
- [ ] Media player — play / pause / seek / next / prev
- [ ] Volume control & progress bar
- [ ] Queue management
- [ ] Shuffle & repeat modes
- [ ] HLS quality switching
- [ ] Playlist & album playback

---

## v0.4.0-admin-panel
- [x] ~~Admin panel UI (Kottster)~~ — removed, see [ADR-0025](../architecture/0025-remove-admin-panel.md)
- [x] Upload tracks & albums
- [x] Manage artists & users
- [x] Content moderation

The operator panel is now the Angular `apps/admin` ([ADR-0035](../architecture/0035-admin-panel-on-angular.md)).

---

## v0.4.5-player-v2-redesign

Tracked in [#234](https://github.com/Lordpluha/bitrate/issues/234). Due 2026-12-23.
Stages the migration [ADR-0039](../architecture/0039-player-as-svelte-custom-element-package.md) left open.

- [ ] New visual design — desktop bar, mini player, floating window, now-playing view
- [ ] Style-variant API on `@bitrate/player` (`PlayerChrome` is declared but unused today)
- [ ] Migrate `apps/web-player`'s playback engine onto `@bitrate/player`
- [ ] Implement the new design on all four player surfaces
- [ ] Adopt the updated variant in admin's `TrackAudioPlayer`
- [ ] Feature additions and optimization pass
- [ ] Regression pass across web-player and admin

---

## v0.5.0-mobile-beta

Tracked in [#225](https://github.com/Lordpluha/bitrate/issues/225). Due 2027-04-30.
Starts once the Player V2 design ships (`v0.4.5`); `apps/mobile` is still the untouched Expo scaffold.

- [ ] Bootstrap conventions — API client, state layer, design-token bridge, tests
- [ ] Auth screens
- [ ] Main feed + player
- [ ] Search
- [ ] Offline mode (download tracks, playlists, albums)
- [ ] Background playback & lock screen controls
- [ ] Push notifications
- [ ] EAS build & beta program

---

## v0.6.0-beta-artists-app

Tracked in [#241](https://github.com/Lordpluha/bitrate/issues/241). Due 2026-12-31. `apps/web-artists`
ships marketing and auth only; the authenticated dashboard is scoped from the MVP boundary in
[Product backlog](../strategy/product-backlog.md) and Stage 2 of the [Tech roadmap](../strategy/tech-roadmap.md).
Screens must be confirmed against the received designs before each item starts.

- [ ] Auth-gated dashboard shell / layout route guard
- [ ] Rights & contributor model, ISRC/UPC identifiers (API)
- [ ] Artist-account RBAC for release collaboration (API)
- [ ] Release Workspace
- [ ] Release Roadmap
- [ ] Release Tasks
- [ ] Distribution adapter and delivery state machine — one DSP partner first
- [ ] Cross-platform analytics *(beyond MVP)*
- [ ] Revenue analytics and forecast *(beyond MVP, needs a billing backend)*
- [ ] Career timeline *(beyond MVP)*

---

## v0.7.0-monitoring-admin-panel-diagrams
- [x] Prometheus, Grafana and Loki in the preprod stack ([ADR-0044](../architecture/0044-observability-stack-prometheus-grafana.md), [ADR-0046](../architecture/0046-loki-log-aggregation.md)); prod is deliberately excluded
- [ ] Metrics and logging gaps: `status_class` labels, `bitrate_api_` prefix, body redaction, request-id correlation (#172, #173)
- [ ] Instrument Prisma, Redis, BullMQ and the audio pipeline (#174)
- [ ] Grafana alert rules and purpose-built dashboards (#177); observability stack in prod (#175)
- [ ] Sentry in `web-artists` (#130) and browser telemetry (#178)
- [ ] CI/CD improvements (deployment automation, security scanning)
- [x] Admin analytics overview (KPI tiles and time series)
- [ ] Drill-down analytics — see `v0.7.7`

---

## v0.7.4-worker-extraction-and-graceful-shutdown

Tracked in [#206](https://github.com/Lordpluha/bitrate/issues/206) and #179. Due 2026-11-13.
Delivers the "extract the transcode worker" item of [Tech roadmap](../strategy/tech-roadmap.md) Stage 1.
This is one deliberate split, not a step toward microservices.

- [ ] Graceful shutdown with readiness gating and job draining (#179)
- [ ] Design the worker process boundary and job contract
- [ ] Extract transcode logic into a standalone worker process (`AUDIO_PROCESSING_WORKER_ENABLED` already exists)
- [ ] Run the worker as a separate deployed service
- [ ] Health checks and monitoring for the worker
- [ ] Staged rollout with a documented rollback

---

## v0.7.5-resilience-and-replication
- [ ] API replicas behind nginx (#182) — needs graceful shutdown
- [ ] Timeouts, retries and circuit breakers (#180)
- [ ] Queue retry policy, DLQ and stall recovery (#181) — mostly in place; the operator DLQ view and stuck-track reaper remain
- [ ] Defined degraded-mode UX for every failure state (#183)
- [ ] PostgreSQL hot standby (#184), WAL archiving and PITR (#185)
- [ ] Failover runbook and recovery drill (#186)

---

## v0.7.6-admin-themes-and-i18n
- [x] Dark / light / dim themes in the operator panel
- [x] EN + UK API errors, validation and emails
- [x] Admin i18n infrastructure (Transloco, locale toggle, `Accept-Language`)
- [ ] Extract remaining admin screen strings into `en` / `uk` dictionaries (#187)

---

## v0.7.7-admin-feature-expansion

Tracked in [#212](https://github.com/Lordpluha/bitrate/issues/212). Due 2027-03-05.
Follows the staged operator-panel plan; overview, detail pages and take-down/restore already shipped.

- [ ] Vendored `dialog`, `select`, `tabs`, `toast` primitives
- [ ] Genres CRUD with guarded delete
- [ ] Albums, public playlists and podcasts — list, detail, take-down and restore
- [ ] ADR addendum: operator panel resource coverage
- [ ] Bulk actions on moderation, catalog and users
- [ ] CSV export for operator lists
- [ ] Drill-down analytics on the Overview dashboard
- [ ] Notifications and Settings pages — deliberately parked until a notifications / billing backend exists

---

## v0.8.0-security
- [ ] Security audit & penetration testing
- [ ] DDoS protection & rate limiting improvements
- [ ] CSRF / XSS / SQL injection hardening
- [ ] Security headers & HTTPS enforcement
- [ ] GDPR compliance & data encryption at rest

---

## v0.9.0-additional
- [x] Like / Unlike — tracks, albums, playlists
- [x] Fuzzy search — tracks, artists, albums, playlists (PostgreSQL `pg_trgm` trigram + GIN)
- [x] Listening history
- [x] Follow / Unfollow artists
- [x] Playlist management — add/remove tracks, owner permissions
- [ ] Search page UI
- [ ] Artist page UI
- [ ] Album page UI
- [ ] Listening history UI
- [ ] User public profiles
- [ ] Profile editing (avatar, bio)
- [ ] Follow users
- [ ] Activity feed
- [ ] Lyrics display
- [ ] Trending & charts
- [ ] Gapless playback & crossfade
- [ ] Equalizer

---

## v1.0.0-rebranding

Delivered by [ADR-0024](../architecture/0024-rebrand-to-bitrate.md).

- [x] New brand name & identity — Bitrate, defined across `docs/brand/` and `design.md`
- [x] Icons redesign — every raster icon is rasterised from the mark; see `design.md` §24
- [ ] Wordmark & lockup — the mark has landed, the wordmark is still raster-only (`design.md` §25)
- [x] Color scheme & design tokens update — Bitrate Purple `#7c3aed`, three themes
- [x] Rename the package namespace to `@bitrate/*`
- [ ] New domain & SSL
- [ ] OG images, favicons, metadata update
- [x] Documentation & marketing materials update

---

## v1.1.0-public-release
- [ ] Production testing & performance optimization
- [ ] App store submission (iOS + Android)
- [ ] Release notes & launch

---

## v1.2.0-desktop-beta
- [ ] System tray & media key integration (Tauri)
- [ ] Local file playback
- [ ] Offline mode & local cache
- [ ] Desktop notifications & auto-updates
- [ ] Cross-platform testing (Windows, macOS, Linux)

---

## Future (2027+)

### Monetization
- [ ] Subscription system (Stripe / PayPal)
- [ ] Premium tiers (ad-free, FLAC, unlimited downloads)

### Social
- [ ] Collaborative playlists
- [ ] Comments & reactions on tracks / albums
- [ ] Real-time listening sessions
- [ ] Share functionality

### Content
- [ ] Podcasts
- [ ] Audiobooks
- [ ] Music videos
- [ ] Radio stations

### AI & Recommendations
- [ ] Daily mixes & Discover Weekly
- [ ] Collaborative + content-based filtering
- [ ] Mood detection
- [ ] Voice commands

### Platforms
- [ ] Smart TV (Android TV, Apple TV, Tizen, webOS)
- [ ] Car integration (Android Auto, CarPlay)
- [ ] Wearables (Apple Watch, Wear OS)
- [ ] Smart speakers (Alexa, Google Assistant)

### Scale
- [ ] Microservices migration — deliberately not planned; only the transcode worker is split out (`v0.7.4`), see [Tech roadmap](../strategy/tech-roadmap.md)
- [ ] CDN for audio & static assets
- [ ] Database sharding & read replicas
- [ ] Auto-scaling & 99.99% uptime
- [ ] Multi-language support (EN, UA, RU, ES, FR)

---

**Change history:**
- 2026-01-11: Initial roadmap
- 2026-06-14: Updated dates; added Taskfile.yml, Changesets, infra/ migration
- 2026-06-21: Simplified to plain todo; updated completed items
- 2026-09-28: Added v0.4.5 (Player V2), v0.7.4 (worker extraction), v0.7.7 (admin expansion); rescoped v0.6.0, v0.7.0, v0.7.5, v0.7.6 to their milestones; documented that version numbers name themes, not release order
