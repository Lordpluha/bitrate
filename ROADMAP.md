# 🚀 MVP Roadmap — Music Platform (Spotify Clone)

## 🎯 MVP Goal
Минимально жизнеспособный продукт, который позволяет:
- Зарегистрироваться/войти
- Загружать и прослушивать музыку
- Видеть список треков
- Управлять воспроизведением
- Работать на десктопе и в мобильной версии

---

## ✅ Phase 1: Auth & User Flow

### 🔐 Auth
- [ ] Signup (email + password)
- [ ] Login/Logout (JWT Access + Refresh)
- [ ] OAuth via Google
- [ ] Basic 2FA (email code or TOTP)
- [ ] Forgot password flow

### 👤 User
- [ ] User profile: avatar, email, name
- [ ] Edit profile form
- [ ] Token refresh and session persistence
- [ ] Zustand or cookie session sync

---

## 🎵 Phase 2: Music Core

### 📂 Upload
- [ ] Upload music file (mp3/flac)
- [ ] Save metadata (artist, title, cover)
- [ ] Image upload (cover art)
- [ ] Audio preview rendering (optional)

### 🔊 Streaming
- [ ] Streaming endpoint (`/stream/:id`)
- [ ] Throttled buffer (NestJS stream response)
- [ ] Next.js frontend audio player
- [ ] Play/Pause, Skip, Volume, Loop

### ❤️ Interactions
- [ ] Like/unlike track
- [ ] Track play counter
- [ ] Track detail page (cover + waveform + actions)

---

## 📁 Phase 3: Track Listing & Pages

### 🗂 Track Feed
- [ ] Home page with recent uploads
- [ ] My uploads (dashboard)
- [ ] Popular/most liked

### 🔎 Search
- [ ] Basic search by track title or artist
- [ ] Autocomplete (optional)
- [ ] Filter by genre

---

## 📦 Phase 4: Backend Infra for MVP

### 🛠 API
- [ ] REST API with NestJS
- [ ] Zod validation
- [ ] Swagger auto-gen
- [ ] Upload endpoint with Multer
- [ ] Auth middleware

### 💾 Database
- [ ] Postgres (initial)
- [ ] Postgres and Prisma schema for users/tracks

### ☁️ Storage
- [ ] Local disk or MinIO-compatible S3
- [ ] Public CDN file access
- [ ] Secure uploads with token

---

## 📲 Phase 5: Mobile MVP

- [ ] View track list
- [ ] Play/Pause audio
- [ ] Like a track
- [ ] Upload from mobile (optional)
- [ ] OAuth login

---

## 🌐 Phase 6: Infra & Deploy MVP

- [ ] Docker Compose: api, client, postgres, nginx
- [ ] Github Actions build + deploy
- [ ] Local nginx + https (optional)
- [ ] Self-hosted Sentry + Postgres backups
- [ ] `.env.schema.ts` and validation

---

## 📘 Phase 7: Docs

- [ ] README
- [ ] ROADMAP
- [ ] Mintlify starter config
- [ ] API Reference
- [ ] CONTRIBUTING.md