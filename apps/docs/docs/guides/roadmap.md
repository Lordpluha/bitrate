---
sidebar_position: 1
---

# Roadmap

> Last updated: June 21, 2026

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

---

## v0.5.0-mobile-beta
- [ ] Auth screens
- [ ] Main feed + player
- [ ] Search
- [ ] Offline mode (download tracks, playlists, albums)
- [ ] Background playback & lock screen controls
- [ ] Push notifications
- [ ] EAS build & beta program

---

## v0.6.0-artists-app
- [ ] Artist public pages (bio, discography, top tracks)
- [ ] Artist upload flow (track + metadata + cover)
- [ ] Artist analytics dashboard (plays, followers, geography)
- [ ] Artist verification system
- [ ] Fan engagement tools

---

## v0.7.0-monitoring
- [ ] Structured logging & log aggregation
- [ ] Sentry alerting & performance monitoring
- [ ] Admin analytics (user growth, content metrics)
- [ ] CI/CD improvements (deployment automation, security scanning)
- [ ] Business diagrams in admin panel

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
- [x] Full-text search — tracks, artists, albums, playlists (PostgreSQL FTS + GIN indexes)
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

- [x] New brand name & identity — Bitrate, defined in `brand.md` and `design.md`
- [x] Icons redesign — every raster icon is rasterised from the mark; see `design.md` §24
- [ ] Wordmark & lockup — the mark has landed, the wordmark is still raster-only (`design.md` §25)
- [x] Color scheme & design tokens update — Bitrate Purple `#7c3aed`, three themes
- [x] Rename the package namespace from `@spotify/*` to `@bitrate/*`
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
- [ ] Microservices migration
- [ ] CDN for audio & static assets
- [ ] Database sharding & read replicas
- [ ] Auto-scaling & 99.99% uptime
- [ ] Multi-language support (EN, UA, RU, ES, FR)

---

**Change history:**
- 2026-01-11: Initial roadmap
- 2026-06-14: Updated dates; added Taskfile.yml, Changesets, infra/ migration
- 2026-06-21: Simplified to plain todo; updated completed items
