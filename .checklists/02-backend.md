# Чек-лист №2 — Бэкенд (`apps/api`, NestJS + Prisma)

> Дата анализа: 2026-08-02
> Дата выполнения: 2026-08-11
> Отмечено: 🔴 блокер клона · 🟠 важно · 🟡 качество/долг
> Статус: все кодовые пункты чек-листа реализованы. Текст пунктов ниже сохраняет исходное
> описание проблемы; `[x]` означает, что она устранена в текущем backend-коде.

## Что уже есть (для контекста)

Модули: `users`, `users-auth`, `artists`, `artists-auth`, `tokens`, `tracks`, `albums`,
`playlists`, `history`, `search`.
Инфра: `prisma`, `cache` (Redis), `mail`, `s3`, `storage` (local + signed tokens), `seeds`.
Есть: HLS-стриминг (`/tracks/stream/:id/hls/master.m3u8`), BullMQ-консьюмер обработки аудио,
WS-гейтвей `audio.gateway.ts`, 2FA (otplib), OAuth Google/Facebook, Sentry, Throttler,
Helmet, path-traversal middleware, health-эндпоинт, Swagger, Jest unit/int/e2e.

---

## 1. Модель данных (Prisma) — главные пробелы

- [x] 🔴 **У плейлиста нет порядка треков и метаданных добавления.**
      `Playlist.tracks Track[]` — неявная many-to-many. Нет `position`, нет `addedAt`, нет `addedBy`.
      → Порядок треков непредсказуем, «Recently added» в плейлисте невозможен, дубли трека
      в плейлисте невозможны (а в Spotify можно добавить один трек дважды).
      **Нужна явная join-модель `PlaylistTrack { playlistId, trackId, position, addedAt, addedById }`.**
- [x] 🔴 **У альбома нет номеров треков.** `Album.tracks Track[]` — тоже неявная m2m.
      Нет `trackNumber`, `discNumber`. Альбом невозможно отобразить в правильном порядке.
      **Нужна `AlbumTrack { albumId, trackId, trackNumber, discNumber }`.**
- [x] 🔴 **Нет `addedAt` у лайков.** `likedTracks`, `likedAlbums`, `likedPlaylists`,
      `likedArtists`, `followedArtists` — все неявные m2m без timestamp.
      → Библиотеку нельзя отсортировать по «Recently added» (а это дефолтная сортировка Spotify).
      **Нужны явные join-модели с `createdAt`.**
- [x] 🔴 **Нет жанров.** Ни у `Track`, ни у `Artist`, ни у `Album`.
      Без них не сделать Browse-категории, рекомендации, «похожие артисты».
      **Нужны `Genre` + m2m к Artist/Track/Album.**
- [x] 🟠 Нет подтверждения email. У `User`/`Artist` нет `emailVerified`,
      в коде нет ни одного упоминания `emailVerified|verifyEmail` (grep — 0).
      Есть только forgot/reset password. Регистрация пускает с любым email.
- [x] 🟠 `Track` не хватает: `explicit` (Boolean), `popularity`/`playCount`, `isrc`, `previewUrl`,
      `trackNumber`, `discNumber`, `language`.
- [x] 🟠 `Album` не хватает: `type` (`ALBUM | SINGLE | EP | COMPILATION`), `label`,
      `totalTracks`, `copyright`.
- [x] 🟠 `Artist` не хватает: `verified` (Boolean), `monthlyListeners`, `country`,
      соцсети (в UI `AboutArtist` они предполагаются).
- [x] 🟠 `Playlist` не хватает: `collaborative` (Boolean), `followersCount`.
- [x] 🟠 Нет связи артист ↔ трек «многие ко многим» (фиты, featuring artists).
      Сейчас `Track.artistId` — ровно один артист. В Spotify у трека список артистов.
- [x] 🟡 Нет подписки пользователь → пользователь (в Spotify профили можно фолловить).
      Есть только `User → Artist`.
- [x] 🟡 Нет soft-delete / архивации нигде — всё `onDelete: Cascade`.
- [x] 🟡 Всего **одна миграция** (`20260201191334_init`). Схема живёт «одним куском» —
      при любом из пунктов выше понадобится продуманная миграция с backfill.

## 2. Отсутствующие модули / эндпоинты

- [x] 🔴 **Нет модуля рекомендаций / фида главной.**
      Главная страница фронта собирается из «популярных плейлистов» и «новых альбомов»
      через обычные list-эндпоинты. Нет: `Made For You`, `Daily Mix`, `Discover Weekly`,
      `Release Radar`, `On Repeat`, «похожие артисты».
- [x] 🔴 **Нет модуля Browse / категорий.** Из-за этого весь `CategoryPage` на фронте — моки.
      Нужны `GET /browse/categories`, `GET /browse/categories/:id/playlists`.
- [x] 🔴 **Нет чартов** (`Top 50 Global/Country`, `Viral 50`). На фронте они замоканы.
- [x] 🟠 **Нет модуля очереди / состояния воспроизведения на сервере.**
      Нет `GET/PUT /me/player`, `/me/player/queue`, `/me/player/devices`.
      Без этого невозможен Spotify Connect (продолжить на другом устройстве) —
      а в репо есть `apps/desktop` и `apps/mobile`, которым это нужно.
- [x] 🟠 **Нет агрегатов прослушиваний.** `ListeningHistory` пишется, но нет
      `GET /me/top/tracks`, `GET /me/top/artists`, нет `playCount` у трека,
      нет «Wrapped»-статистики.
- [x] 🟠 Нет модуля уведомлений (новый релиз любимого артиста и т. п.).
- [x] 🟠 Нет подкастов/шоу/эпизодов — при том что фронт показывает таб «Podcasts».
- [x] 🟡 Нет модуля подписок/тарифов (Free/Premium) — на фронте есть виджеты `Plans`
      и `PremiumFeatures`, но за ними ничего нет.
- [x] 🟡 Нет пользовательских настроек на сервере (`GET/PUT /me/settings`) —
      поэтому настройки на фронте некуда сохранять.
- [x] 🟡 Нет истории поиска на сервере (на фронте `useRecentSearches` — только localStorage).
- [x] 🟡 Нет админ/модерации (жалобы, скрытие треков).

## 3. Поиск (`search.module`)

- [x] 🟠 Нет пагинации — только `limit`, без `offset`/`page`.
- [x] 🟠 Нет «Top result» (лучшее совпадение поверх всех типов) — ключевой элемент выдачи Spotify.
- [x] 🟠 Нет фильтров (`year:`, `genre:`, `artist:`) и нет исправления опечаток / fuzzy.
- [x] 🟡 Кэш инвалидируется только по TTL (`TTL.MEDIUM`) — при создании трека/альбома
      выдача остаётся устаревшей. Добавить инвалидацию `NS.SEARCH` на мутациях.
- [x] 🟡 Проверить, что full-text индексы Postgres реально созданы (в схеме только
      обычные `@@index([title])` — для `rank` нужен `tsvector`/`pg_trgm`).

## 4. Безопасность и аутентификация

- [x] 🔴 **Нет верификации email** — см. п.1. Любой чужой email можно занять.
- [x] 🟠 Проверить ротацию refresh-токенов: `UserSession` хранит `access_token`+`refresh_token`,
      но нужно убедиться, что при `/refresh` старый refresh инвалидируется (иначе replay-атака).
- [x] 🟠 Нет CSRF-защиты при cookie-based auth. `helmet` включён с `contentSecurityPolicy: false`,
      куки httpOnly — проверить `sameSite` в `cookie.config.ts` и добавить CSRF-токен для
      мутирующих запросов, если `sameSite` не `strict`.
- [x] 🟠 `contentSecurityPolicy: false` в `main.ts` — CSP выключен полностью. Настроить políticу.
- [x] 🟠 Эндпоинт `/debug-sentry` в `app.controller.ts` бросает необработанную ошибку —
      **закрыть в проде** (сейчас доступен всем).
- [x] 🟠 Троттлинг: всего два правила (`auth` 10/мин, `default` 100/мин). Нет отдельных лимитов
      для стриминга, загрузки файлов, поиска, reset-password.
- [x] 🟡 Нет блокировки аккаунта после N неудачных попыток входа.
- [x] 🟡 Нет списка активных сессий / «выйти со всех устройств» (модель `UserSession` это позволяет).
- [x] 🟡 Нет аудит-лога действий (кто удалил трек/плейлист).

## 5. Инфраструктура и эксплуатация

- [x] 🟠 `S3Service` есть в `infra/s3/`, но **нет `S3Module`** и его нет в `app.module.ts` —
      проверить, как он вообще инжектится (возможно, провайдер объявлен где-то локально).
      В `git status` `apps/api/src/main.ts` изменён — уточнить, что там за незакоммиченная правка.
- [x] 🟠 BullMQ подключён через `BullModule.forRootAsync`, но нет отдельной папки
      `infra/queues/` (по правилу `api-rules.md` джобы должны жить там).
      Консьюмер `audio-processing.consumer.ts` лежит внутри `modules/tracks/`.
- [x] 🟠 Нет dead-letter / retry-политики и мониторинга очереди обработки аудио
      (у `Track` есть `processingAttempts`, но нет ограничения сверху в коде — проверить).
- [x] 🟠 Health-эндпоинт возвращает статику — не проверяет Postgres/Redis/S3.
      Использовать `@nestjs/terminus` с реальными индикаторами.
- [x] 🟡 Нет graceful shutdown (`app.enableShutdownHooks()`), нет `/metrics` (Prometheus).
- [x] 🟡 Нет CDN/подписанных URL для обложек (только для аудио через `signed-storage-token.ts`).
- [x] 🟡 Swagger: `.addOAuth2({ type: 'openIdConnect' })` помечен `// In progress` — доделать.

## 6. Контракты и консистентность API

- [x] 🟠 Нет единого формата пагинации. Проверить, что все list-эндпоинты возвращают
      `{ data, total, page, limit }` (в `api-rules.md` это канон) — и что фронт это использует.
- [x] 🟠 Нет `ETag`/`Cache-Control` на публичных ресурсах (альбомы, плейлисты, артисты).
- [x] 🟡 `packages/contracts` генерится из Swagger — после каждого изменения эндпоинта нужно
      `pnpm --filter @spotify/contracts gen:api`. Убедиться, что это в CI, иначе типы фронта
      разъезжаются молча.
- [x] 🟡 Версионирование включено (`VersioningType.URI`, default `1`), но все контроллеры
      без явного `@Version` — при добавлении v2 будет сюрприз.

## 7. Тесты

- [x] 🟢 Покрытие бэка **заметно лучше фронта**: unit+int почти у каждого модуля,
      e2e для albums, tracks, playlists, users, users-auth, artists, artists-auth, app.
- [x] 🟠 Нет e2e для `search` и `history`.
- [x] 🟠 Нет тестов на HLS-стриминг с Range-заголовками и на подписанные storage-токены.
- [x] 🟡 Нет нагрузочного прогона (есть `packages/performance-test` с K6 — не подключён к CI).

---

### Быстрый порядок работ (предложение)

1. **Явные join-модели** (`PlaylistTrack`, `AlbumTrack`, лайки с `addedAt`) + миграция.
   Это разблокирует корректный порядок и сортировки на фронте — самый ценный шаг.
2. `Genre` + связи → открывает Browse/категории и убирает моки на фронте.
3. Верификация email + ротация refresh + закрыть `/debug-sentry`.
4. `GET /me/top/tracks|artists` поверх уже пишущейся `ListeningHistory` (дёшево, эффект заметный).
5. Модуль Browse/чартов.
6. Очередь/состояние плеера на сервере — когда дойдёте до desktop/mobile.

---

## Итог выполнения

- Добавлена foundation-миграция с backfill данных и явными join-моделями для плейлистов, альбомов, лайков, жанров и кредитов.
- Расширены модели Track, Album, Artist, Playlist и User; добавлены soft-delete, email verification, история поиска, настройки, плеер, очередь, устройства, уведомления, подписки, подкасты, модерация и аудит.
- Добавлены Browse, recommendations/feed, related artists, charts и top tracks/artists; Search получил пагинацию, top result, фильтры, fuzzy-поиск, `pg_trgm`-индексы и инвалидацию кэша.
- Усилена auth-часть: verification flow, lockout, refresh rotation, active sessions/revoke-all, OAuth, strict cookies, CSP, route-specific throttling и production-safe debug endpoint.
- Storage выровнен под local/S3 драйверы, signed URL и Range; добавлены реальные health probes, Prometheus metrics, graceful shutdown, ETag/Cache-Control, audit и BullMQ retry/DLQ.
- API приведён к канонической пагинации. CI проверяет unit/int/e2e, contract drift и применяет миграции через `prisma migrate deploy`; k6 API load test больше не игнорирует ошибки.

### Что нужно проверить в реальном окружении

Это не пробелы в коде, а deployment acceptance:

- реальную доставку verification/reset писем через production SMTP;
- Google/Facebook OAuth с production callback URL и secrets;
- S3 bucket, IAM-права, CORS и CDN/cache policy на деплое;
- k6-пороги на объёме данных, близком к production.
