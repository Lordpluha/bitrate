# PR #137 — профессиональный code review и полный fix-checklist

> PR: `Fix/web player visual polish #137`  
> Дата ревью: 2026-08-18  
> Base: `5623be990c21eb1e7380ec9ff521876e3fa53ad2` (`origin/develop`)  
> Head: `f72b2f0465df484d567ce92d6c0bcf76212b44a8`  
> Объём в GitHub: 7 commits, 591 file entries, `+46 578 / -7 253`  
> Решение ревью: **REQUEST CHANGES — в текущем виде merge запрещён**.

Этот документ составлен по точным Git-объектам base/head в отдельном detached worktree. Текущая рабочая копия разработчика не использовалась как источник ревью. Исходники не исправлялись и commit не создавался.

## Как читать приоритеты

- **P0 / merge blocker** — утечка секретов, неразрешённый merge conflict или гарантированно красный release gate. Исправить до любого merge/deploy.
- **P1 / high** — сломанный пользовательский сценарий, риск потери/подмены данных, auth/security defect или опасный rollout. Исправить в этом PR либо вынести функциональность из PR.
- **P2 / medium** — заметная correctness, accessibility, performance или maintainability проблема. Нужен владелец и закрытие до production rollout.
- **P3 / cleanup** — технический долг, репозиторная гигиена и улучшение инструментария. Не терять: назначить отдельную задачу, если не закрывается здесь.
- Пометка **legacy** означает, что дефект обнаружен в изменённом файле, но существовал в base. Это всё равно реальная проблема, однако её нельзя выдавать за регрессию автора PR.

## Executive release gates

- [ ] Устранить публичную выдачу `password`, `email` и `twoFactorSecret` артистов и выполнить incident response, если эта версия хотя бы раз была доступна извне.
- [ ] Разрешить merge conflict в `packages/ui-react/src/styles/palette.css` осознанно, с визуальной проверкой обеих тем.
- [ ] Добиться зелёного typecheck в чистом checkout, не полагаясь на заранее существующий `.next/types`.
- [ ] Запустить реальные GitHub Actions на обновлённом head и получить все required checks; у проверенного head нет ни workflow run, ни commit status.
- [ ] Исправить user OAuth session expiry, artist OAuth 2FA cookie и все user/artist email links.
- [ ] Согласовать runtime API, OpenAPI, generated contracts и Zod-схемы.
- [ ] Сделать безопасный migration/deploy plan для foundation migration и legacy sessions.
- [ ] Перевести CMAF publication на immutable versioned generations с CAS-переключением.
- [ ] Свести queue/repeat/prefetch/ended/hover к одному алгоритму перехода.
- [ ] Добавить интеграционные MSE/Range/fallback тесты, которых сейчас нет.
- [ ] Удалить generated screenshots/orphan binary artifacts до merge, чтобы они не попали в историю `develop`.
- [ ] После всех исправлений повторить security, migration, API contract, browser E2E и production-container проверки из Definition of Done.

---

## 1. Что фактически проверено

### 1.1 Автоматические проверки exact HEAD

- [x] `git diff --check origin/develop...HEAD` — проходит.
- [x] `pnpm exec biome ci apps/api packages/contracts apps/web-player packages/converter packages/ui-react` — код проходит; осталось 7 warnings.
  - 6 warnings внесены PR: non-null assertions в `fragmentIndex.unit-spec.ts:62,89,164,165` и `sourceBufferQueue.unit-spec.ts:23,24`.
  - `packages/converter/src/video.mjs:29` — pre-existing unused catch binding, не регрессия PR.
- [x] Исходные две ошибки из пользовательского лога уже исправлены в проверенном head:
  - unused `ROUTES` удалён из `LibraryMusicList.tsx`;
  - helper `run` в `http-cache.interceptor.unit-spec.ts:32-41` больше не объявлен `async`.
- [x] Production build `@spotify/web-player` — проходит на чистом exact HEAD после разрешения сетевой загрузки Google Fonts; сгенерированы все 27 static/dynamic routes.
- [x] `@spotify/web-player` unit tests — 16 files, 97 tests passed.
- [x] `@spotify/converter` — 6 suites, 102 tests passed.
- [x] API unit tests — 29 suites, 281 tests passed.
- [x] Prisma client generation — проходит при заданных `DATABASE_URL` и `SHADOW_DATABASE_URL`.
- [x] `@spotify/ui-react` build — проходит.
- [ ] Fresh-checkout `pnpm check-types` — **не проходит** до `next build/typegen`; подробности в P0-03.
- [ ] Полный monorepo `pnpm build` в изолированном worktree не завершён: API prebuild требует env/DB config, отсутствующие в чистом worktree. Это отдельно нужно воспроизвести в CI-контейнере.
- [ ] API integration/e2e и browser E2E локально не выполнялись: для них нужен подготовленный PostgreSQL/Redis/браузерный стенд. Они обязательны после исправлений.
- [ ] GitHub Actions для exact head отсутствуют: live metadata вернул пустые workflow runs и statuses.

### 1.2 Статический анализ и инвентаризация

- [x] Проверены backend, обе Prisma migration, schema, auth, discovery, search, storage, observability, converter и generated contracts.
- [x] Проверены frontend routes/proxy, auth forms, API adapters/Zod, player/MSE, library, settings, PWA, accessibility и metadata.
- [x] `knip` запущен; подтверждены unused/dead candidates и undeclared direct imports, перечисленные ниже.
- [x] Проверены 10 удалённых файлов. Доказательств случайного удаления рабочей функциональности не найдено; подробный список в разделе 13.
- [x] Проведён отдельный аудит больших файлов и ответственности, а не механическая проверка по числу строк.

### 1.3 Проверенные кандидаты, которые не являются findings

- [x] Предположение о `useSearchParams` без `Suspense` как build blocker **не подтвердилось**: exact `next build` успешно prerender-ит login, verify-email, search и library routes. Не создавать фиктивную задачу без runtime evidence.
- [x] Stored XSS через private audio source не подтверждён: audio хранится в private directory и проходит metadata inspection. Реальная XSS относится только к public cover upload, см. P1-10.
- [x] `packages/contracts/src/api/v1.ts` большой, но generated. Его нельзя вручную дробить или редактировать; исправлять нужно Swagger/OpenAPI source и generator.
- [x] Удалённый `liked-songs.jpg` заменён SVG, а оставшиеся ссылки обновлены.

---

## 2. P0 — обязательные блокеры merge

### P0-01. Anonymous endpoint раскрывает password hash и TOTP-secret артистов

**Где:**

- `apps/api/src/modules/discovery/discovery.controller.ts:44-50`
- `apps/api/src/modules/discovery/discovery.service.ts:113-129`
- `apps/api/src/modules/discovery/discovery.service.ts:186-205`
- `apps/api/prisma/schema.prisma:215-234`
- похожие blacklist projections: `apps/api/src/modules/artists/artists.service.ts:53-59,68-73,115-121,137-140,152-155,159-170`

**Что ломается:** публичный `GET /api/v1/recommendations/related-artists/:artistId` вызывает `prisma.artist.findMany({ include: ... })` без `select/omit`. Prisma сериализует все scalar fields: `email`, Argon/password hash, `twoFactorSecret`, lockout state и внутренние признаки аккаунта. За один запрос можно получить до 50 аккаунтов. `getTopArtists` повторяет full-row leak для авторизованных пользователей. Старые artist endpoints omit-ят только `password/email`, но продолжают отдавать `twoFactorSecret` и internal auth state.

**Исправление:**

- [ ] Немедленно закрыть/временно отключить affected endpoints до исправления projection.
- [ ] Создать один типизированный `PUBLIC_ARTIST_SELECT` с allowlist только продуктовых полей: `id`, `username`, `bio`, public media, `verified`, public counters/country/socials и явно допустимые relations.
- [ ] Запретить blacklist `omit` для public/self separation; self DTO также не должен возвращать raw `twoFactorSecret`.
- [ ] Применить allowlist к discovery related/top, artists list/detail/follow/unfollow/following, search/recommendations и всем вложенным artist relations.
- [ ] Исправить Swagger entities и regenerated `packages/contracts/src/api/v1.ts`.
- [ ] Инвалидировать Redis/cache entries, которые могли сохранить небезопасные artist rows.
- [ ] Добавить recursive response sanitizer test, проверяющий отсутствие `email`, `password`, `twoFactorSecret`, `failedLoginAttempts`, `lockedUntil`, `deletedAt` во всех public artist-bearing endpoints.
- [ ] Добавить anonymous E2E на related-artists и authenticated E2E на top-artists.
- [ ] Если ветка/preview/API уже были доступны пользователям: зафиксировать security incident, сбросить/перехешировать пароли по процедуре, перевыпустить все TOTP secrets, отозвать сессии, очистить логи/cache и уведомить владельца security-процесса.

**Критерий приёмки:** forbidden keys отсутствуют на любой глубине runtime JSON и OpenAPI; security regression suite проходит; принято письменное решение по incident response.

### P0-02. PR имеет merge conflict и ни одного фактического CI result

**Где:** `packages/ui-react/src/styles/palette.css`; GitHub head `f72b2f0`.

**Что ломается:** GitHub помечает PR как conflicting. Для exact head API вернул пустые workflow runs и combined statuses, поэтому screenshot с `Checks 0` — реальное отсутствие проверки, а не зелёный CI.

**Исправление:**

- [ ] Обновить feature branch от актуального `develop` без destructive reset.
- [ ] Разрешить `palette.css` на уровне design tokens: проверить semantic light/dark variables, а не выбрать одну сторону conflict вслепую.
- [ ] Запустить visual smoke/screenshot tests для light и dark themes после resolution.
- [ ] Убедиться, что GitHub Actions действительно стартовали на новом SHA.
- [ ] Настроить required branch protection как минимум для API, web-player, contracts/typecheck, tests и security workflows.
- [ ] Не merge-ить через обход required checks/admin override.

**Критерий приёмки:** PR показывает `mergeable`, все required checks относятся к последнему SHA и зелёные.

### P0-03. Чистый CI typecheck зависит от артефактов предыдущего Next build

**Где:**

- `apps/web-player/package.json:13`
- `.github/workflows/web_player_reusable.yml:71-77`
- `apps/web-player/src/app/main/(playlists)/playlist/[id]/page.tsx:7-23`
- `apps/web-player/src/app/main/album/[id]/page.tsx:7-23`
- `apps/web-player/src/app/main/artist/[id]/page.tsx:7-23`

**Что ломается:** `check-types` равен `tsc --noEmit`, а новые страницы используют generated global `PageProps<route>`. В fresh checkout `.next/types` отсутствует, и typecheck падает на строках 9/23 трёх страниц. Production `next build` проходит, потому что Next сначала генерирует route types; workflow, наоборот, запускает typecheck до Docker/build.

**Исправление:**

- [ ] Изменить script на `next typegen && tsc --noEmit` либо отказаться от generated global в пользу явного shared page-props type.
- [ ] Не добавлять `.next/types` в Git.
- [ ] Добавить CI job, который удаляет/не восстанавливает `.next`, ставит dependencies из lockfile и запускает typecheck первым.
- [ ] Проверить, что Turbo cache key не маскирует отсутствие generated types.
- [ ] Сохранить отдельный production `next build` gate.

**Критерий приёмки:** `git clean`/fresh clone → install → `pnpm --filter @spotify/web-player check-types` проходит без предварительного build.

---

## 3. P1 — authentication, authorization и account security

### P1-01. User OAuth создаёт сессию, которую guard немедленно отвергает

**Где:** `apps/api/src/modules/users-auth/oauth.service.ts:218-229`, `users-auth.guard.ts:122-130`; правильный аналог — `artists-auth/artist-oauth.service.ts:220-226`.

- [ ] При создании user OAuth session записывать `expiresAt: token.getRefreshTokenExpiresAt()`.
- [ ] Вынести создание password/OAuth/2FA sessions обеих persona в единый factory, где expiry обязательна типом.
- [ ] Добавить transaction/compensation, чтобы cookies не выдавались без сохранённой session.
- [ ] Добавить E2E: OAuth callback → cookies → `/auth/me` → refresh → logout.
- [ ] Добавить negative test на expired session.

**Критерий:** первый authenticated request после OAuth не возвращает `SESSION_NOT_FOUND`.

### P1-02. Rollout принудительно инвалидирует все legacy sessions без плана

**Где:** `schema.prisma:95-118`, `users-auth.guard.ts:122-130`, `artists-auth.guard.ts:108-116`, `user-auth.service.ts:236-247`, foundation migration.

- [ ] Выбрать и документировать policy: backfill `expiresAt = createdAt + refresh TTL` либо явный one-time forced logout/delete.
- [ ] Реализовать policy migration до включения нового guard.
- [ ] После backfill сделать `UserSession.expiresAt` и `ArtistSession.expiresAt` `NOT NULL`.
- [ ] Согласовать `getSessions`: сейчас он показывает `NULL` как active, хотя guard их отвергает.
- [ ] Добавить upgrade test базы с pre-PR sessions `expiresAt IS NULL`.
- [ ] Проверить refresh/access cookie TTL и DB expiry одним clock source.

**Критерий:** rollout не имеет неявного поведения; список sessions и guard дают одинаковый результат.

### P1-03. Один `WEB_HOST` не может обслужить user и artist auth flows

**Где:**

- `apps/api/src/infra/mail/mail.service.ts:36-38,65-67,90-103`
- `apps/api/src/modules/artists-auth/artists-auth.service.ts:38-68,183-198`
- `apps/api/src/modules/artists-auth/artists-auth.controller.ts:250-315`
- `apps/api/src/common/config/connections.ts:13-42`

**Дефекты:** user reset email ведёт на `/reset-password`, хотя web-player route — `/auth/reset-password`; artist reset использует тот же URL, но должен открыть web-artists form; artist verify ведёт на отсутствующий `/artist/verify-email`; artist OAuth redirect и CORS также используют user host. Artist registration при этом всегда требует verification, а login блокирует unverified account.

- [ ] Добавить validated `USER_WEB_HOST` и `ARTIST_WEB_HOST` как absolute origins без path/query.
- [ ] Разделить `sendUserPasswordReset`, `sendArtistPasswordReset`, user/artist verification URL builders.
- [ ] Создать реальный artist verify-email route/form либо изменить ссылку на существующий route.
- [ ] Обновить OAuth success/error/2FA redirects по persona.
- [ ] Разрешить оба точных origin в CORS; не использовать wildcard с credentials.
- [ ] Обновить `.env.example`, Config schema, Dockerfile/compose, CI and deployment secrets.
- [ ] В E2E извлекать URL из настоящего MailHog/test SMTP письма и завершать user/artist verify/reset.

**Критерий:** все четыре mail flows и оба OAuth flows завершаются в правильном frontend.

### P1-04. Web proxy блокирует новые anonymous routes

**Где:** `apps/web-player/src/proxy.ts:12-35`, `useRegistrationForm.ts:30-38`, `public/sw.js:1-10`, shims `/login` и `/login/2fa`.

- [ ] Централизовать route metadata/public matcher вместо отдельного неполного массива.
- [ ] Добавить `/verify-email`, `/login`, `/login/2fa`, `/offline` в anonymous routes.
- [ ] Сохранять OAuth error/query parameters при redirect.
- [ ] Проверить, что `/offline` precache получает offline HTML, а не login redirect.
- [ ] Добавить table-driven proxy tests для каждого public/protected path, query и trailing slash.
- [ ] Добавить E2E registration → verify, OAuth error, OAuth 2FA и offline install.

**Критерий:** anonymous пользователь попадает на требуемый экран, а protected `/main/**` остаётся закрытым.

### P1-05. Login modal игнорирует обязательный 2FA

**Где:** `apps/web-player/src/features/AuthModal/model/useLoginModalForm.ts:11-31`; правильная проверка есть в `features/Login/model/useLoginForm.ts:16-23`.

- [ ] Создать общий typed login-success handler для modal и full-page form.
- [ ] При `{requires2fa:true}` закрывать modal и вести на `/auth/login/2fa`, не на `/main`.
- [ ] Не считать отсутствие auth cookies успешной авторизацией.
- [ ] Добавить tests на обычный login, 2FA response и mutation error.

### P1-06. Signup modal отправляет unverified пользователя обратно в login

**Где:** `apps/web-player/src/features/AuthModal/model/useSignUpModalForm.ts:12-43`.

- [ ] На success передавать введённый email в `ROUTES.auth.verifyEmail(email)`.
- [ ] Не показывать ложное сообщение “Please log in”, пока backend запрещает unverified login.
- [ ] Унифицировать success handler с full registration form.
- [ ] Добавить component/E2E test modal signup → verify-email → resend/verify.

### P1-07. Login schema отвергает валидные legacy credentials

**Где:** `entities/User/model/auth.schema.ts:4-7`, `shared/validation/password.validation.ts:3-17`, backend `users-auth/dtos/login.dto.ts:5-10`.

- [ ] Разделить `loginCredentialSchema` и new-password strength policy.
- [ ] На login проверять только безопасные length/type limits, не наличие upper/special characters.
- [ ] Согласовать min/max с backend либо вынести общий contract.
- [ ] Добавить contract tests на существующие 6/7-char и `password123` credentials.

### P1-08. Artist OAuth + 2FA cookie недоступна verify endpoint

**Где:** `artists-auth.controller.ts:299-315`; правильный user variant — `users-auth.controller.ts:307-325`.

- [ ] Для `pending_2fa_token` установить `path: '/'` и production `secure`.
- [ ] Использовать единый cookie options builder, чтобы user/artist варианты не расходились.
- [ ] При очистке cookie использовать те же `path/domain/sameSite/secure` attributes.
- [ ] Добавить browser E2E artist OAuth account с включённым 2FA.

### P1-09. Soft-deleted artist продолжает логиниться и мутировать данные

**Где:** `artists.service.ts:94-104`, `artists-auth.guard.ts:105-116`, `artists.private.service.ts:82-86`, `artists-auth.service.ts:55-68`.

- [ ] Soft-delete artist и revoke sessions выполнить одной transaction.
- [ ] Во всех login/guard/refresh/2FA/OAuth lookup добавить `deletedAt: null`.
- [ ] Запретить mutations уже authenticated deleted artist.
- [ ] Определить restore и повторную регистрацию email semantics.
- [ ] Добавить E2E: delete → current token, refresh, password login и OAuth отклоняются.

### P1-10. Public cover upload допускает stored XSS (**legacy, но high-risk**)

**Где:** `tracks.controller.ts:149-180,208-239`, `app.module.ts:43-54`, `main.ts:19-32`.

`filename=x.html` + multipart `Content-Type: image/png` проходит client-controlled MIME filter, сохраняется с `.html` в public static directory и отдаётся как HTML. API cookies имеют `path=/`; CSP разрешает inline scripts. Это существовало в base, но файл затронут PR.

- [ ] Не доверять `originalname` и multipart MIME.
- [ ] Определять формат по magic bytes и успешно декодировать изображение.
- [ ] Re-encode через Sharp в server-chosen WebP/JPEG/PNG и выдавать server-chosen extension/content type.
- [ ] Рассмотреть отдельный cookieless media origin; до этого усилить CSP и `nosniff`.
- [ ] Reject SVG/HTML/polyglot, oversized dimensions, decompression bombs и malformed images.
- [ ] Добавить security tests: `.html` spoof, polyglot, invalid image, valid formats.

**Критерий:** загруженный пользователем файл никогда не исполняется как active content на auth origin.

### P1-11. Public User/Artist DTO раскрывают internal auth state

**Где:** `safe-user.entity.ts:5-52`, `safe-artists.entity.ts:5-68`, `users.service.ts:14-82`, `artists.service.ts:53-170`.

- [ ] Разделить `PublicUser`, `SelfUser`, `PublicArtist`, `SelfArtist/AdminArtist`.
- [ ] Public projections строить allowlist-`select`, не `omit`.
- [ ] Убрать `failedLoginAttempts`, `lockedUntil`, `twoFactorEnabled`, `emailVerifiedAt`, `deletedAt` из anonymous responses.
- [ ] В following relations фильтровать soft-deleted entities.
- [ ] Исправить Swagger и frontend schemas.
- [ ] Добавить snapshot/contract tests forbidden keys на всех endpoints.

### P1-12. Login lockout теряет параллельные failed attempts

**Где:** `user-auth.service.ts:278-289`, `artists-auth.service.ts:260-271`.

- [ ] Заменить stale read-modify-write на atomic increment/row lock/conditional update.
- [ ] Вычислять threshold по значению, возвращённому БД.
- [ ] Проверить поведение на нескольких API replicas.
- [ ] Решить, должен ли 429 известного locked email отличаться от 401 неизвестного аккаунта; документировать enumeration trade-off.
- [ ] Добавить concurrent test из N bad logins и recovery после lock TTL.

### P1-13. Cross-site cookie topology требует явного решения (**условный release gate**)

**Где:** `cookie.config.ts:4-8`, `connections.ts:13-42`, фактические deployment origins.

- [ ] Зафиксировать production topology: same-site custom subdomains или разные registrable domains.
- [ ] Если sites разные, `SameSite=Strict`/`Lax` не работает для credentialed XHR: выбрать `SameSite=None; Secure` и внедрить строгую CSRF/Origin protection.
- [ ] Если sites одинаковые, зафиксировать домены и cookie domain/path semantics в tests/docs.
- [ ] Добавить browser test login/refresh/logout на production-like origins, не только localhost.

---

## 4. P1 — API contract и runtime data correctness

### P1-14. `/playlists` runtime envelope противоречит generated contract

**Где:** `playlists.service.ts:38-60`, `usePlaylistQueries.ts:14-20`, `packages/contracts/src/api/v1.ts:8525-8545`, consumer `PublicProfilePage.tsx:15-20`.

- [ ] Исправить Swagger response с `PlaylistEntity[]` на `{data,total,page,limit}`.
- [ ] Создать reusable typed paginated response decorator/schema.
- [ ] Regenerate contracts.
- [ ] Нормализовать `usePlaylists` через `libraryPlaylistsResponseSchema`, как уже сделано для `useMyPlaylists`.
- [ ] Исправить active consumers; `PublicProfilePage` не должен вызывать `.filter` у envelope.
- [ ] `PopularPlaylists.tsx` либо удалить как orphan, либо также исправить до повторного подключения.
- [ ] Добавить API→frontend integration test на настоящий response JSON.

### P1-15. Public user schema требует `email`, которого API намеренно не отдаёт

**Где:** `userResponse.schema.ts:4-17`, `User/api/client/hooks.ts:33-78`, `users.service.ts:14-24,54-82`.

- [ ] Ввести отдельный `publicUserResponseSchema` без email/internal auth fields.
- [ ] Self profile использовать отдельный schema/endpoint.
- [ ] Удалить unsafe `as never` вокруг generated path params после исправления OpenAPI.
- [ ] Добавить tests реального `/users` и `/users/{id}` JSON.

**Критерий:** public profile/search users не превращаются в “User not found” из-за Zod parse error.

### P1-16. Nullable covers отклоняются Zod-схемами целиком

**Где:** `albumResponse.schema.ts:4,31`, `trackResponse.schema.ts:3+`, `historyResponse.schema.ts:10+`; DB `schema.prisma:133-138,305-309`; create track допускает cover `null`.

- [ ] Исправить API entities/OpenAPI nullability.
- [ ] Изменить client schemas на `z.string().nullable()` для optional covers.
- [ ] В UI всегда применять корректный fallback resolver.
- [ ] Добавить fixtures с одним coverless item в tracks/albums/album detail/liked/history.
- [ ] Проверить, что один nullable item не отбрасывает весь response.

### P1-17. Search подставляет username вместо UUID relationship fields

**Где:** backend `search.service.ts:219-293`, client `features/Search/api/client/hooks.ts:72-107`, `buildSearchRows.ts:65-71`, `ArtistLink.tsx:20-31`.

- [ ] Search DTO должен отдельно возвращать `artistId`/`ownerId` и display `subtitle`.
- [ ] Не переиспользовать presentation string как entity identifier.
- [ ] Обновить SQL selects, OpenAPI, generated contracts и Zod schema.
- [ ] Добавить contract test с username, который заведомо не UUID.
- [ ] Проверить song artist link, album artist link и playlist owner navigation.

### P1-18. Paginated API responses системно не совпадают со Swagger

**Где:** фактические envelopes в albums `:55-75`, artists `:53-63`, tracks `:356-365`, playlists `:42-59`, users `:69-82`; decorators перечислены в backend review; generated contract errors около `v1.ts:5224,6193,7166,8525,9858`.

- [ ] Создать generic `PaginatedResponseDto<T>`/Swagger helper с `data,total,page,limit`.
- [ ] Исправить `ApiQuery` vs ошибочные `ApiParam` для users list.
- [ ] Описать status 200 и item schema для каждого catalog endpoint.
- [ ] Regenerate contracts только после запуска настоящего API OpenAPI document.
- [ ] Добавить CI contract test: runtime response валидируется OpenAPI schema.
- [ ] После regeneration убрать frontend casts/workarounds, скрывавшие drift.

### P1-19. OpenAPI generator глотает ошибку и может ложно озеленить CI

**Где:** `packages/contracts/src/scripts/fetch-openapi.ts:4-15`, `.github/workflows/api_reusable.yml:154-166`.

- [ ] Не завершать script через `main().catch(console.error)` с exit code 0.
- [ ] На failure rethrow либо установить `process.exitCode = 1`.
- [ ] Писать generated file атомарно только после успешного fetch/parse.
- [ ] Добавить test с недоступным/invalid `OPENAPI_URL`: команда обязана быть non-zero и не менять файл.

---

## 5. P1 — CMAF publication, Range и playback lifecycle

### P1-20. Canonical CMAF publication имеет race и неатомарный rollout

**Где:** `audio-processing.consumer.ts:128-221,350-372,415-448`, `tracks.controller.ts:307-317`, `track-playback.service.ts:69-143`.

- [ ] Добавить неизменяемый `sourceGeneration`/content hash/job version на Track/TrackFile.
- [ ] Писать объекты в `tracks/{trackId}/cmaf/{generation}/{bitrate}.m4a`, не overwrite canonical key.
- [ ] Upload all renditions с bounded concurrency; проверить size/index/checksum каждого объекта.
- [ ] Выполнить CAS transaction: обновить manifest/current generation только если `audioUrl/sourceGeneration` всё ещё соответствует job.
- [ ] Если CAS проигран, не ставить Track `READY` и удалить только объекты проигравшей generation.
- [ ] Переключать DB pointer только после полной публикации; старую generation удалить асинхронно после grace period.
- [ ] Manifest и rendition должны ссылаться на одну generation.
- [ ] Добавить barrier tests двух interleaved jobs, upload failure, DB failure после upload, stale job completion и чтение во время flip.

**Критерий:** невозможно получить старый manifest с новыми bytes или наоборот; immutable URL действительно immutable.

### P1-21. Manifest/rendition не проверяют READY и текущую generation

**Где:** `track-playback.service.ts:69-98,129-143`.

- [ ] Для manifest фильтровать `deletedAt:null`, `processingStatus:READY`, current playback generation.
- [ ] Rendition lookup связывать с parent Track lifecycle и current generation.
- [ ] Не отдавать bytes FAILED/PROCESSING/deleted/obsolete rendition по известному ID.
- [ ] Добавить tests, что storage даже не вызывается для invalid lifecycle.

### P1-22. Range client принимает полный `200` и повреждённый `206`

**Где:** `apps/web-player/src/entities/Player/api/client/hooks.ts:34-46`.

- [ ] Для fragment request требовать status `206`.
- [ ] Parse `Content-Range: bytes start-end/total` и сравнивать exact requested inclusive bounds.
- [ ] Проверять `ArrayBuffer.byteLength === end-start+1`.
- [ ] Отдельно обработать `416` и stale manifest/generation.
- [ ] Не append-ить response до полной validation.
- [ ] Tests: 200/full file, missing/wrong header, wrong total, short/long body, exact valid 206, 416.

### P1-23. Backend превращает invalid/unsatisfiable Range в whole-file 200

**Где:** `track-playback.service.ts:164-204`, `tracks.controller.ts:279-320`.

- [ ] Различать отсутствие Range и malformed/unsatisfiable Range.
- [ ] На unsatisfiable вернуть `416` и `Content-Range: bytes */<size>`.
- [ ] Ограничить единственный supported range; явно решить multi-range policy.
- [ ] Проверить inclusive arithmetic, suffix/open-ended ranges и integer overflow.
- [ ] Добавить controller/service tests и синхронизировать client behavior.

### P1-24. Manifest кешируется навсегда, а transient error навсегда включает legacy

**Где:** `useManifestResolver.ts:23-47`.

- [ ] Только явный `404/no CMAF` превращать в `null` fallback.
- [ ] `429/5xx/network/parse` должны throw и иметь bounded retry/backoff.
- [ ] Убрать `staleTime/gcTime: Infinity` либо включить generation/ETag в key.
- [ ] Инвалидировать manifest при track audio update.
- [ ] Ограничить память query cache для больших fragment maps.
- [ ] Tests: 503→200 recovery, 404 fallback, generation replacement, eviction.

### P1-25. `StreamLoader.start()` может зависнуть или дать unhandled rejection

**Где:** `attachCmafSource.ts:68-80`, `streamLoader.ts:151-205`.

- [ ] `attachCmafSource` должен await/catch весь `loader.start()` lifecycle.
- [ ] Ожидать `sourceopen`, `error`, `sourceclose`, abort/destroy и timeout.
- [ ] `destroy()` обязан завершать pending startup promise.
- [ ] Ловить `addSourceBuffer`, `mode`, `duration` exceptions внутри общего error boundary.
- [ ] На failure cleanup object URL/listeners и attach HLS/progressive ровно один раз.
- [ ] Проверять playback key, чтобы error stale prefetched slot не остановил current slot.
- [ ] Tests: never-open, destroy-before-open, SourceBuffer throw, stale slot, fallback-once.

### P1-26. Transient fragment failure немедленно убивает playback

**Где:** `streamLoader.ts:365-408`, `useAudioSlots.ts:~93`, `attachCmafSource.ts:68-73`.

- [ ] Реализовать bounded retry/backoff с jitter для network/429/5xx.
- [ ] Уважать `AbortSignal` и не retry-ить validation/4xx кроме явно retryable.
- [ ] После исчерпания retry попробовать emergency lower bitrate.
- [ ] Затем HLS/progressive fallback с сохранением `currentTime` и play/pause intent.
- [ ] Добавить telemetry с generation/bitrate/range/attempt без sensitive URL tokens.
- [ ] Tests: first 503→success, abort, downgrade, persistent failure→fallback, currentTime resume.

### P1-27. Seek/repeat после `MediaSource.endOfStream()` не может восстановиться

**Где:** `sourceBufferQueue.ts:81-94`, `streamLoader.ts:227-270,322-324,411-415`.

- [ ] Определить reopen strategy для ended MediaSource: новый MediaSource/init segment/download head либо не вызывать EOS до безопасного lifecycle point.
- [ ] При seek в удалённый ранний range переинициализировать buffer корректно.
- [ ] Сбрасывать scheduler state, pending request и bitrate state атомарно.
- [ ] Browser MSE test: track >60s, trim old range, дождаться EOS, seek 0 и repeat-one → новые Range requests и resumed audio.

### P1-28. Manifest schema почти не валидирует media contract

**Где:** `trackManifest.schema.ts:3-20`, backend `track-manifest.entity.ts`, `TrackFile.fragments` JSON.

- [ ] Требовать exact supported `version`.
- [ ] `timescale/durationTicks/bitrate/length` — positive safe integers; offsets/start/durations — nonnegative integers.
- [ ] Validate inclusive ranges, file size bounds, monotonic non-overlapping fragments.
- [ ] Проверить alignment fragment grid между renditions.
- [ ] Backend должен валидировать Prisma JSON перед response, не cast-ить blind `number[][]`.
- [ ] Добавить schema tests на zero/negative/fractional/out-of-order/out-of-bounds/version mismatch.

---

## 6. P1 — player state и последовательность треков

### P1-29. Queue/repeat/prefetch/ended используют разные модели “следующего трека”

**Где:**

- `audioPlayer.utils.ts:106-125`
- `useAudioPlayer.ts:29,67-87`
- `useAudioPlayerEvents.ts:190-224`
- `playerStore.utils.ts:66-87`
- `usePlayerNavigationTracks.ts:16-42`
- `PlayerControls.tsx:42,60-87`

**Подтверждённые сценарии:** last B в `[A,B]` с repeat-off запускает prefetched A, хотя store оставляет UI paused/B; queue X после A сначала может запустить prefetched B; singleton A + queue X не расходует queue; A→queued X теряет playlist cursor `-1` и не продолжает B; queued copy current track имеет тот же playback key; hover показывает B, хотя click сыграет X.

- [ ] Создать один pure `getPlaybackTransition(state, reason)`/`actualNextCandidate`.
- [ ] Приоритет: queue, затем playlist cursor с repeat-one/all/off semantics.
- [ ] Хранить canonical playlist cursor отдельно от ad-hoc queue current item.
- [ ] Дать queue item/playback instance уникальный key, даже если track ID одинаков.
- [ ] Store transition commit выполнить до audio slot switch; проверить, что standby key совпадает с committed candidate.
- [ ] Prefetch, ended, next button, hover/ARIA preview и MediaSession должны использовать тот же selector.
- [ ] Не запускать standby, если committed transition = stop.
- [ ] Tests: `[A,B]` last repeat-off; repeat-all; repeat-one; singleton+X; A+X+B; 2 queued; same current track queued; previous; hover text = фактическому click; stale prefetch.

### P1-30. Shuffle имеет несколько источников истины и протекает между contexts

**Где:** `usePlayerHotkeys.ts:101-104`, `usePlaylistShuffle.ts:35-66`, `playerStore.actions.ts:28+`, `useArtistPlayback.ts:71+`.

- [ ] Hotkey S должен вызывать ту же domain action, что UI button, а не только toggle flag.
- [ ] Хранить canonical order и current shuffled order внутри playback context/store, не component ref.
- [ ] `playPlaylist(newContext)` атомарно задаёт shuffle policy и не восстанавливает старый playlist.
- [ ] Current track остаётся первым/не скачет при включении shuffle.
- [ ] Tests: S меняет order; disable восстанавливает; shuffle A → normal play B; artist shuffle → playlist; current item stable.

---

## 7. P1/P2 — database migration и deployment safety

### P1-31. 793-line foundation migration нельзя безопасно раскатывать rolling deploy

**Где:** `20260811120000_backend_platform_foundation/migration.sql:1-793`; FK drops `:16-59`, backfill `:736-778`, extension/indexes `:780-784`, table drops `:786-793`.

- [ ] Разделить на expand → application dual-read/write → backfill → verification → contract.
- [ ] Не удалять implicit join tables в том же deploy, где появляются новые.
- [ ] Выбрать transaction boundaries; Prisma/PostgreSQL migration не должна оставаться partially applied при late failure.
- [ ] Preflight права на `CREATE EXTENSION pg_trgm` отдельно от data migration.
- [ ] Создавать тяжёлые GIN indexes контролируемым online/concurrent шагом с lock/statement timeout.
- [ ] Проверить совместимость старого binary с expanded schema и нового binary со старой/expanded schema.
- [ ] Сделать row-count, duplicate, FK/orphan и ownership assertions до drop.
- [ ] Зафиксировать rollback/roll-forward runbook и maintenance window, если zero-downtime не реализуется.
- [ ] Rehearsal на production-size sanitized copy с замером lock time/disk/WAL.
- [ ] Failure-injection test на extension, index и backfill stage; повторный deploy должен быть recoverable.

### P2-01. Backfill выдумывает playlist/album ordering

**Где:** migration `:737-748`.

- [ ] Подтвердить product owner-ом, что playlist position по UUID и album track number по `releaseDate, UUID` приемлемы.
- [ ] Если исходный порядок существует вне relation table, импортировать его.
- [ ] Подготовить reconciliation report и ручной список неоднозначных albums/playlists.
- [ ] Не называть синтетический order восстановленным историческим order.

### P2-02. Raw pg_trgm indexes имеют schema drift risk

**Где:** migration `:780-784`, следующая migration `20260811130440_cmaf_playback_index/migration.sql:1-5`.

- [ ] Зафиксировать unmanaged indexes в migration policy/tooling.
- [ ] Добавить CI check `prisma migrate diff`, который не предлагает случайно удалить production indexes.
- [ ] Документировать extension/index ownership и восстановление.

### P3-01. Verification token indexes дублируются

**Где:** foundation migration `:425-440`.

- [ ] Удалить обычный index на column, уже покрытый unique index, если query plan не доказывает обратное.
- [ ] Проверить итоговые index names/schema после migration.

---

## 8. P2 — backend correctness, scalability и observability

### P2-03. Discovery `total` равен размеру текущей страницы

**Где:** `discovery.service.ts:159-209`.

- [ ] Получать общий grouped count через отдельный query или `COUNT(*) OVER()` до pagination.
- [ ] В SQL отфильтровать deleted/unready track/artist до LIMIT/OFFSET, иначе Prisma drop недоступных rows оставляет неполные страницы.
- [ ] Добавить deterministic tie-break (`plays DESC, id`).
- [ ] Tests: 3+ pages, last/empty page, deleted/unready history rows, равный plays count.

### P2-04. Charts ранжируются по полям, которые никто не поддерживает

**Где:** `discovery.service.ts:132-155`, `schema.prisma` fields `playCount/popularity/monthlyListeners`; repository search показывает в основном reads/seed.

- [ ] Определить источник истины для play count, popularity и monthly listeners.
- [ ] Сделать idempotent aggregation job/event pipeline с периодом и anti-abuse rules.
- [ ] Не increment-ить hot row синхронно на каждом timeupdate без contention design.
- [ ] Backfill существующие data либо скрыть charts до появления meaningful values.
- [ ] Tests с history events и time-window rollover.

### P2-05. `related-artists` принимает отрицательный/нулевой limit

**Где:** `discovery.controller.ts:44-49`, `discovery.service.ts:113-129`.

- [ ] Использовать общий positive bounded pagination validator.
- [ ] Tests: `-1`, `0`, `1`, `50`, `51`, non-integer.

### P2-06. Catalog offset pagination недетерминирована

**Где:** albums `:55-69`, artists `:53-60`, tracks `:356-363`, playlists `:42-56`, users `:69-80` — `findMany` без `orderBy`.

- [ ] Добавить stable sort с unique tie-break, например `createdAt DESC, id DESC`.
- [ ] Для больших/часто меняющихся каталогов рассмотреть cursor pagination.
- [ ] Tests с одинаковыми timestamps и insert между page 1/page 2.

### P2-07. Search pagination означает `limit` на каждый type, но `total` суммарный

**Где:** `search.service.ts:43-80,119-293`.

- [ ] Формально определить contract: общий ranked stream либо отдельная pagination metadata на bucket.
- [ ] Если `limit=10` общий — merge/rank и отдать максимум 10; если per-type — вернуть totals/pages per type и переименовать поле.
- [ ] Не возвращать до `4 * limit` под metadata одного page.
- [ ] Удалить duplication SQL count/search через typed query builders/repositories, сохранив parameterization.
- [ ] Contract tests на multi-type и single-type requests.

### P2-08. History загружает все distinct groups только ради count

**Где:** `history.service.ts:31-69`.

- [ ] Заменить полный `groupBy` на `COUNT(DISTINCT trackId)` raw query/поддерживаемый aggregate.
- [ ] Фильтровать deleted/unready tracks согласованно с response.
- [ ] Убрать non-null assertion `byTrackId.get(id)!` через typed filter/helper.
- [ ] Performance test с большой history.

### P2-09. Device activation разрушает state до validation и имеет race

**Где:** `me.service.ts:110-123`, `schema.prisma:593-606`.

- [ ] Сначала проверить ownership/existence `dto.id`, затем менять state.
- [ ] Деактивацию и activation выполнить transaction с row/advisory lock.
- [ ] Добавить DB invariant: максимум одно active device на user (partial unique index или эквивалент).
- [ ] Tests: invalid ID не меняет active device; два concurrent requests оставляют ровно одно active.

### P2-10. Playlist positions collide при concurrent add

**Где:** `playlists.service.ts:217-252`; schema unique `(playlistId, position)`.

- [ ] Сериализовать append per playlist (`FOR UPDATE`, advisory lock или retry strategy).
- [ ] Не вычислять `MAX(position)+1` вне защищённой critical section.
- [ ] Решить duplicate track semantics: `uniqueTrackIds` проверяются, но `dto.trackIds` с duplicates всё равно создаются.
- [ ] Concurrent integration test двух append requests; позиции последовательны и order deterministic.

### P2-11. Moderation report принимает несуществующую/неверную entity

**Где:** `moderation.controller.ts:9-28`.

- [ ] Вынести controller DB call в service.
- [ ] Resolve target по `entityType`, проверить existence, lifecycle и report permission.
- [ ] Добавить duplicate/spam/rate policy и idempotency.
- [ ] Tests: nonexistent UUID, mismatched type, deleted/private target, duplicate.

### P2-12. Audit log fire-and-forget и `entityType=api`

**Где:** `audit.interceptor.ts:23-55`.

- [ ] Определить требуемую durability: await перед success либо transactional outbox/durable queue.
- [ ] Не терять audit event при process shutdown/DB transient failure.
- [ ] Получать entity/action из route/controller metadata, а не первого segment `request.path`.
- [ ] Добавить correlation/request ID, actor type, безопасный metadata allowlist и retention policy.
- [ ] Учитывать proxy IP только после trust-proxy hardening.
- [ ] Tests: запись существует после mutation response, правильный entity, DB failure policy.

### P2-13. Global throttler считает reverse proxy одним клиентом

**Где:** `app.module.ts:65,95+`, `main.ts:15-47`, deployment proxy config.

- [ ] Настроить Express `trust proxy` только на известное число hops/CIDR до guard initialization.
- [ ] Не доверять произвольному public `X-Forwarded-For`.
- [ ] Для multi-replica использовать Redis-backed storage; in-memory buckets обходятся по replica/restart.
- [ ] Выбрать tracker: authenticated principal для auth-sensitive routes, IP для anonymous с IPv6 normalization.
- [ ] Integration tests через реальный reverse proxy: два client IP не делят bucket, spoofed XFF не обходит limit.

### P2-14. Metrics endpoint публичный и локален одному process

**Где:** `app.controller.ts:73-77`, `metrics.service.ts:7-37`.

- [ ] Закрыть scrape endpoint network policy/service auth либо internal bind.
- [ ] Выставить корректный Prometheus content type.
- [ ] Использовать стандартный registry/OTel, безопасное escaping labels и bounded route cardinality.
- [ ] Учесть multi-replica aggregation/restarts.
- [ ] Не публиковать sensitive route/status traffic anonymous users.

### P2-15. Detailed health раскрывает topology и не ограничивает probe time

**Где:** `app.controller.ts:33-57`.

- [ ] Разделить public liveness (generic) и protected/internal readiness (dependency details).
- [ ] Добавить per-dependency timeout, чтобы health не зависал.
- [ ] Не отдавать public `env`, dependency names и подробный failure object без необходимости.
- [ ] Проверить orchestrator probes и startup/readiness thresholds.

### P2-16. S3 `exists()` использует GET Range и не закрывает body

**Где:** `s3.service.ts:162-174`; новый caller `storage.controller.ts:39-49`.

- [ ] Использовать `HeadObjectCommand`.
- [ ] Маппить только genuine not-found в `false`; permission/network errors не скрывать.
- [ ] Test assert command type и отсутствие response stream.

### P2-17. Upload lifecycle оставляет orphan files (**legacy**)

**Где:** `tracks.controller.ts:149-256`, `tracks.service.ts:466-603`, consumer cleanup `:120-122,231-233`.

- [ ] Писать upload в staging area; переносить/commit-ить только после validation и DB intent.
- [ ] В `catch/finally` удалять новый source/cover при DTO, ownership, metadata, DB или enqueue failure.
- [ ] После успешной replacement удалять старые unreferenced assets через durable outbox/GC.
- [ ] Soft-delete должен иметь retention/physical cleanup policy.
- [ ] GC обязан быть reference-aware и generation-aware, чтобы concurrent job не удалил current asset.
- [ ] Fault-injection tests на каждый этап.

### P2-18. Low-bitrate source создаёт job, который converter гарантированно отвергает

**Где:** `tracks.service.ts:97-105,124-136`, `converter/src/cmaf.mjs:61-64`.

- [ ] Свести target bitrate policy в один shared helper.
- [ ] Clamp minimum к 32 kbps либо reject upload синхронно до queue с понятным 4xx.
- [ ] Boundary tests `0,1,31,32,127,128`.

### P2-19. CMAF indexer читает полную rendition в RAM

**Где:** `converter/src/cmaf.mjs:122-130`.

- [ ] Перейти на file-handle/ranged parser для top-level headers и `sidx`.
- [ ] Валидировать box boundaries/size до allocation/read.
- [ ] Ограничить source duration/output size и worker concurrency.
- [ ] Large sparse-file test с memory ceiling; запретить `readFile` whole object.

### P2-20. HLS/storage publication имеет unbounded `Promise.all`

**Где:** `audio-processing.consumer.ts:399-465`.

- [ ] Ограничить concurrent file reads/uploads через pool/backpressure.
- [ ] Не открывать тысячи streams/descriptors одновременно на длинном track.
- [ ] На partial failure отменить outstanding uploads и cleanup generation.
- [ ] Load test на длинный input и медленное object storage.

### P2-21. Album helper теряет Prisma type safety

**Где:** `albums.service.ts:13-28` (`Record<string, unknown>`).

- [ ] Описать `Prisma.AlbumGetPayload` с точным include/select.
- [ ] Убрать `Record<string, unknown>` и casts из flatten helper.
- [ ] Compile-time test/typed fixture на relation shape.

### P2-22. Session revoke принимает malformed UUID и может вернуть 500

**Где:** `users-auth.controller.ts:180-185`.

- [ ] Добавить `ParseUUIDPipe` к `@Param('id')`.
- [ ] Нормализовать not-found/invalid response без Prisma connector detail.
- [ ] Controller tests на malformed UUID, чужую session и valid own session.

### P2-23. Dev/test без SMTP создаёт аккаунты, которые нельзя активировать

**Где:** `mail.service.ts:25-32,40-44,69-73,93-95`.

- [ ] Поднять MailHog/test transport в local/CI либо реализовать явно gated dev-only verification flow.
- [ ] Не логировать raw verification/reset token в production.
- [ ] Registration response/dev docs должны объяснять способ завершения verification.
- [ ] E2E environment обязан реально доставлять письмо.

### P3-02. Storage health проверяет не те capabilities

**Где:** `local-storage.service.ts:38-42`, `s3.service.ts:42-46`.

- [ ] Для local проверить read/write и безопасный create/delete probe.
- [ ] Для S3 проверить минимальные required operations либо explicit permission health contract.
- [ ] Tests read-only volume/credentials должны давать unhealthy.

### P3-03. Load-test readiness loop не fail-ит job

**Где:** `.github/workflows/performance_api_load_reusable.yml:83-105`.

- [ ] Проверять `/api/v1/health`, а не только welcome.
- [ ] После последней неудачи печатать log и `exit 1`.
- [ ] Сохранять PID и cleanup background process через trap.

---

## 9. P2 — frontend data/state/product correctness

### P2-24. Artist page фильтрует только первую глобальную сотню

**Где:** `views/Artist/model/useArtistContent.ts:17-31`.

- [ ] Добавить artist-scoped tracks/albums endpoints или server filters.
- [ ] Не загружать global page 1 и не фильтровать client-side.
- [ ] Реализовать pagination/“show all” для каталога артиста.
- [ ] Test: нужный artist не входит в первые 100 global records, но его releases показываются.

### P2-25. Liked/follow state обрезается первой страницей

**Где:** `useTrackQueries.ts:61+`, `Artist/api/client/hooks.ts:84+`, `User/api/client/hooks.ts:83-94`.

- [ ] Для card-level state добавить batch/status endpoints (`isLiked/isFollowing`) либо normalized relationship cache.
- [ ] Для library использовать infinite/cursor pagination до конца.
- [ ] Не определять state по случайно загруженной первой странице.
- [ ] Boundary tests на 21-го artist и 101-й track/user.

### P2-26. Albums/playlist library не использует server source of truth

**Где:** `LikeAlbumButton.tsx:21+`, `views/Library/model/useLibraryData.ts:31+`, `usePlaylistLike.ts:29+`, `usePlaylistLibraryItems.ts:34+`.

- [ ] Добавить/использовать liked album/playlist list и status API.
- [ ] React Query cache — source of truth; localStorage только optional optimistic/offline cache с reconciliation.
- [ ] Album button инициализировать server state, не `false`.
- [ ] Albums tab не должен показывать первые 50 глобальных albums.
- [ ] Reload, logout/login другого user и cross-device tests.

### P2-27. Saved episodes превращаются в podcast links с episode ID

**Где:** `widgets/LeftSidebar/model/useLibraryItems.ts:33-57`, `resolveLibraryHref.ts:15-19`, правильный podcast ID используется в `PodcastsPanel.tsx:87-90`.

- [ ] Решить UX model: unique podcast rows либо отдельный episode item/route.
- [ ] Для podcast rows использовать `episode.podcastId`/`episode.podcast.id`, podcast title/cover/publisher.
- [ ] Deduplicate несколько saved episodes одного podcast.
- [ ] Использовать `getPodcastCoverUrl`, не playlist resolver.
- [ ] Paginate все saved episodes, не только page 1/20; показать error/retry.
- [ ] Tests: correct href, dedupe, >20 entries, API error.

### P2-28. `MusicCardLg` повторно нормализует уже готовый `/api-media` URL

**Где:** `shared/ui/MusicCardLg.tsx:26-30`, `mediaUrl.ts:86-95`, callers `PodcastsPanel.tsx:120-125`, `LibraryMusicList.tsx:29-36`.

- [ ] Установить один контракт: card принимает final `src` без преобразования либо raw value + explicit media kind.
- [ ] Нормализовать URL ровно один раз.
- [ ] Передавать artist kind явно; не считать всё playlist.
- [ ] Tests raw filename, `/static/...`, resolved `/api-media/...`, remote HTTPS и invalid input.

### P2-29. Search ошибки маскируются как “No results”

**Где:** `features/Search/ui/SearchPage.tsx:22+`, `SearchQueryState.tsx:20-47`.

- [ ] Передавать `isError/error/refetch` обеих queries.
- [ ] Различать empty success, total failure и partial failure users/catalog.
- [ ] Показывать Retry и доступное status сообщение.
- [ ] Tests: 500, Zod contract error, partial result, genuine empty.

### P2-30. Settings UI обещает эффекты, которых нет, и имеет две несовместимые модели

**Где:** `Settings/model/settings.types.ts:3+`, `Me/api/client/me.schemas.ts:3+`, `SettingsPage.tsx:30+`, `AudioSettingsSection.tsx:46+`.

- [ ] Выбрать одну canonical enum/model (`automatic` vs `Automatic`, включая `very-high`).
- [ ] Синхронизировать все поддерживаемые server settings при hydration/mutation.
- [ ] Подключить streaming quality к ABR/manual mode и normalizeVolume к реальному audio graph либо скрыть/disable control.
- [ ] Убрать/пометить неработающие video/privacy toggles.
- [ ] Добавить behavioral tests, а не только Zustand setter tests.

### P2-31. Listening history навсегда теряет play после transient failure

**Где:** `widgets/Player/model/useRecordListenedTrack.ts:33-39`, `entities/History/api/client/hooks.ts:38-59`.

- [ ] Ставить `recordedTrackIdRef` только после success либо очищать на error.
- [ ] Добавить bounded retry и server idempotency/dedupe semantics.
- [ ] Не отправлять duplicates во время pending.
- [ ] Fake-timer test: 15s → first reject → recovery records exactly once.

### P2-32. In-buffer seek повторно скачивает и append-ит уже buffered fragments

**Где:** `streamLoader.ts:227-255`.

- [ ] Определять первый отсутствующий fragment по `TimeRanges`.
- [ ] Clear/reseed только для out-of-window seek.
- [ ] Не append-ить overlapping media range, который MSE уже содержит.
- [ ] Integration test retained-range seek не создаёт duplicate Range request.

### P2-33. `StreamLoader.setBitrate()` обещает pin, но ABR сразу перезаписывает его

**Где:** `streamLoader.ts:209+`.

- [ ] Либо удалить unused misleading API, либо ввести explicit `auto/manual` mode.
- [ ] Manual bitrate должен переживать ABR tick; возврат в auto — отдельное действие.
- [ ] Unit/integration tests manual pin, emergency downgrade policy и auto restore.

---

## 10. P2 — accessibility, interaction и UI integrity

### P2-34. Global hotkeys перехватывают native activation controls

**Где:** `usePlayerHotkeys.ts:20-27,55-64`.

- [ ] Игнорировать `button`, `a`, inputs/select/textarea, `[role=button]`, `[role=slider]`, contenteditable и интерактивных descendants через `closest`.
- [ ] Уважать `event.defaultPrevented`, modifiers и IME/composition.
- [ ] Вызывать `preventDefault` только для реально обработанной global команды.
- [ ] Tests: focused Play/Next/Like/seek/volume; Space/Enter выполняет ровно одно native действие, arrows не крадутся.

### P2-35. PlaybackProgress ломается от второго pointer и seek-ит на cancel

**Где:** `PlaybackProgress.tsx:50-75`; существующий spec покрывает только keyboard.

- [ ] Не использовать `{once:true}` до совпадения active pointer ID.
- [ ] На чужой `pointerup` оставить listeners активными.
- [ ] `pointercancel` только сбрасывает drag, не вызывает seek.
- [ ] Использовать pointer capture и ref для preview, не rebind effect на каждый move.
- [ ] Tests pointer 1/2, second-up-first, cancel-no-seek, lost capture.

### P2-36. Header search suggestions недоступны с клавиатуры

**Где:** `HeaderSearch.tsx:15-37`, `HeaderSearchDropdown.tsx:30-39`.

- [ ] Реализовать корректный combobox/listbox: `aria-expanded`, `aria-controls`, active descendant или managed option focus.
- [ ] Поддержать ArrowUp/Down, Enter, Escape и Tab policy.
- [ ] Blur проверять через `relatedTarget`/focus-within, не unmount-ить до keyboard selection.
- [ ] Tests и screen-reader semantics.

### P2-37. Closed burger drawer остаётся в tab order

**Где:** `BurgerMenuPanel.tsx:31-94`, `useOverlayFocus.ts:31-32`.

- [ ] Conditional mount либо `inert` + `visibility:hidden` для closed state.
- [ ] Open state: initial focus, focus trap, Escape, backdrop, return focus trigger.
- [ ] Closed controls не должны быть focusable/pointer-active.
- [ ] Keyboard tests open/close/tab-cycle/restore.

### P2-38. ARIA menus не реализуют menu keyboard model

**Где:** `PlaylistMenus.tsx:23+`, `usePlaylistActionMenus.ts:12+`, `CreatePlaylistMenu.tsx:21-62`.

- [ ] Либо использовать обычную disclosure/list semantics, либо готовый Base UI Popover/Menu.
- [ ] Для `role=menu`: initial focus, arrows, Home/End, Escape, outside dismiss, focus return.
- [ ] Trigger: `aria-haspopup`, `aria-controls`, `aria-expanded`.
- [ ] Position должен обновляться на scroll/resize; fixed magic coordinates убрать.
- [ ] Объединить desktop create menu с уже более корректным mobile overlay primitive.

### P2-39. Enabled buttons не имеют действия

**Где:** `PlaylistPrimaryActions.tsx:62+` (Download/Invite/Mix), `ArtistActionBar.tsx:73+` (More), profile menu routes ниже.

- [ ] Реализовать action либо скрыть/disable с понятным unavailable state.
- [ ] Не оставлять focusable control без handler.
- [ ] Interaction tests для каждого enabled action.

### P2-40. Profile menu ведёт на dead/duplicated destinations

**Где:** `ProfileMenuContent.tsx:17-34`, `routes.ts:35-39`.

- [ ] Account и Settings не должны быть двумя названиями одного `/main/preferences`, если это не осознанный IA.
- [ ] `#support`/`#download` должны иметь существующую цель либо пункт скрывается.
- [ ] External icon использовать только для настоящей external ссылки с корректным target/rel.
- [ ] Navigation tests на каждый menu item.

### P2-41. UI безусловно помечает каждого артиста verified

**Где:** `RightSidebar/AboutArtist.tsx:63-70`.

- [ ] Передавать реальный backend `verified` field и показывать badge только при true.
- [ ] Удалить badge, если verification semantics ещё не готовы.
- [ ] Tests verified/unverified.

### P2-42. Hidden NowPlaying overlay остаётся тяжело смонтированным

**Где:** `NowPlayingView.tsx:33-42,80-103`, `AboutArtist.tsx:42-49`, `usePlayerController.ts:29,46-60`.

- [ ] Не монтировать heavy details/body до `isOpen` либо lazy-mount с сохранением нужного state.
- [ ] Не загружать duplicate `priority` artist image для hidden overlay/sidebar.
- [ ] Заменить whole-store Zustand subscription на atomic selectors; timeupdate не должен rerender-ить весь player tree.
- [ ] Проверить React Profiler и network при выборе track, не открывая overlay.

### P2-43. Library expand/collapse controls имеют одинаковое accessible name

**Где:** `LibraryHeader.tsx:11,54-60,74-79`.

- [ ] Использовать `isExpanded` и разные localized labels “Expand/Collapse Your Library”.
- [ ] Добавить `aria-expanded`/controls где применимо.
- [ ] Accessibility test по состояниям.

### P2-44. Новый i18n покрывает интерфейс частично

**Где:** новые Player, Podcasts, Profile, Notifications, Create, search/settings status strings и 5 message catalogs.

- [ ] Инвентаризировать все новые hardcoded user-facing English strings.
- [ ] Добавить typed keys одновременно в en/uk/ru/pl/de; CI должен ловить missing keys.
- [ ] Перевести aria-label, toast, empty/error/loading states, не только headings.
- [ ] Locale smoke tests representative auth/library/player/podcast flows.
- [ ] `app/layout.tsx:71` не должен навсегда оставлять `<html lang="en">`; хранить locale в server-readable cookie и синхронизировать document lang.

---

## 11. P2 — PWA, caching, metadata и deployment config

### P2-45. Service worker cache lifecycle небезопасен и неограничен

**Где:** `apps/web-player/public/sw.js:1-60`, rewrite `/api-media` в `next.config.ts:38-44`.

- [ ] Использовать versioned precache manifest/build hash; static cache-first не должен жить как вечный `v1`.
- [ ] Не cache-ить mutable/authenticated/dynamic media; `/api-media` сейчас не исключён правилом `/api/`.
- [ ] Уважать `Cache-Control: no-store/private` и request credentials.
- [ ] Ограничить runtime cache по entries/age/quota; определить strategy per asset class.
- [ ] `cache.put` включить в awaited `respondWith`/`event.waitUntil`, не fire-and-forget.
- [ ] Activation удаляет только caches с owned prefix, не все origin caches.
- [ ] Навигация offline должна отдавать корректный offline document после public-route fix.
- [ ] Tests: same URL after deploy refreshes, unrelated cache survives, write completes, mutable media не stale, quota bounded.

### P2-46. Service worker registration rejection необработан

**Где:** `ServiceWorkerRegistration.tsx:14-16`.

- [ ] Catch registration/update error, исключить unhandled rejection.
- [ ] Добавить low-noise telemetry и не спамить пользователя на unsupported/private mode.
- [ ] Test rejected `navigator.serviceWorker.register`.

### P2-47. Production canonical/OG/sitemap молча указывают localhost

**Где:** `shared/constants/site.ts:1-5`, `app/layout.tsx:22-24`, `robots.ts`, `sitemap.ts`; env/Docker/compose не содержат `NEXT_PUBLIC_SITE_URL`.

- [ ] Добавить required production `SITE_URL`/`NEXT_PUBLIC_SITE_URL` в `env.schema.ts`.
- [ ] Реально импортировать/исполнять env validation на build/start; текущий schema сам по себе не используется.
- [ ] Передать build ARG/ENV в Dockerfile, prod/preprod compose и CI.
- [ ] В production запретить localhost fallback и валидировать HTTPS/trailing slash.
- [ ] Test generated metadata, robots и sitemap production image.

### P2-48. Server metadata fetch использует `API_URL`, которого нет в production image

**Где:** `serverApiClass.ts:8`, server APIs, `apps/web-player/env.schema.ts:9`, `Dockerfile:35-38`, `infra/docker-compose.prod.yaml:78-106`.

- [ ] Передать server-only `API_URL` в build/runtime container.
- [ ] Не путать browser public URL и container-internal API URL.
- [ ] Fail-fast env validation вместо silent metadata `.catch(() => null)` для config errors.
- [ ] Production-container integration test dynamic album/artist/playlist metadata.

### P2-49. Sitemap рекламирует auth URLs, которые robots запрещает

**Где:** `app/sitemap.ts:9-17`, `app/robots.ts:9-10`.

- [ ] Удалить login/registration из sitemap либо разрешить index согласно SEO решению.
- [ ] Оставить в sitemap только canonical indexable pages.
- [ ] Test no URL одновременно listed и disallowed.

---

## 12. P2/P3 — repository hygiene, dependencies, dead code и документация

### P2-50. В product PR закоммичено ~21.38 MB подозрительных design/generated artifacts

**Подтверждённая инвентаризация:**

- `artist-about.png` — 988,540 B, ни одной code/docs ссылки.
- `output/playwright/` — 6 PNG, 1,521,750 B; этот же PR добавляет `/output/playwright/` в `.gitignore`, значит это generated output.
- `pencil/` — 18,727,592 B: 22 timestamp-named generated PNG и 3 `.pen` source files.
- `shemas/player-veriants.drawio` — 146,313 B; единственная ссылка из ADR, в directory и filename опечатки.
- `design-qa.md` — 8,939 B; ссылается на отсутствующие screenshot names и не соответствует закоммиченным library captures.

- [ ] Удалить `output/playwright/**` из PR до merge.
- [ ] Удалить orphan root `artist-about.png` либо переместить в документированное asset location и добавить реальную ссылку.
- [ ] Решить policy для `.pen`: source design может быть нужен, но generated timestamp PNG не должны жить в product Git; использовать LFS/design storage/docs artifact по принятому решению.
- [ ] Если drawio нужен ADR: перенести в семантический docs asset path, например `apps/docs/static/architecture/player-variants.drawio`, и исправить ADR link.
- [ ] Исправить `shemas/player-veriants` → `schemas/player-variants` либо удалить.
- [ ] Обновить `design-qa.md` реальными воспроизводимыми commands/screenshots либо удалить stale document.
- [ ] Добавить CI guard на forbidden generated directories, timestamp blobs и max blob size.

**Важно:** удалить до merge; последующий delete не уменьшит историю clone `develop`.

### P3-04. Непереносимый `reprocess-cmaf.mjs`

**Где:** `apps/api/reprocess-cmaf.mjs:7-43`.

- [ ] Удалить из PR либо превратить в поддерживаемую CLI.
- [ ] Убрать hardcoded `/home/spiderman/Рабочий стол/...`.
- [ ] Исправить usage filename `reprocess.mjs`.
- [ ] Не подставлять fake `artistId:'reprocess'`; читать и проверять Track ownership/source из DB.
- [ ] Переиспользовать shared queue name/options, не дублировать.
- [ ] Добавить `--dry-run`, batch/resume/idempotency, structured logging и package script/docs.
- [ ] Валидировать source filename/path traversal.

### P3-05. Dead/orphan frontend code

**Где:**

- `widgets/MainPanel/ui/PodcastsEmptyState.tsx` — нет imports;
- `widgets/MainPanel/ui/NewAlbums.tsx` — orphan после нового MainPanel;
- `widgets/MainPanel/ui/PopularPlaylists.tsx` — orphan после нового MainPanel;
- `shared/hooks/useProgressiveAudioStreaming.ts` — 231 строк, только barrel export, consumers нет.

- [ ] Удалить из PR, если код не часть shipping path.
- [ ] Если должен использоваться — подключить осознанно, добавить tests и убрать дублирующий путь.
- [ ] Не хранить два “legacy fallback” implementation без владельца/exit criteria.
- [ ] Добавить targeted `knip` CI с allowlist только для доказанных dynamic entries.

### P3-06. Undeclared direct dependencies

**Где:** `apps/web-player/package.json`; `lucide-react` импортируется примерно в 58 files, `server-only` — в 5 server files, но оба доступны только транзитивно.

- [ ] Добавить используемые packages как direct dependencies web-player либо импортировать icons через публичный `@spotify/ui-react` API.
- [ ] Не полагаться на pnpm hoisting/transitive graph.
- [ ] Проверить install с strict isolated linker/fresh lockfile.

### P3-07. Biome warnings в новых tests

- [ ] Заменить non-null assertions в `fragmentIndex.unit-spec.ts:62,89,164,165` на helper/assertion, который делает runtime narrowing.
- [ ] Заменить non-null assertions в `sourceBufferQueue.unit-spec.ts:23,24`.
- [ ] Отдельно почистить baseline warning `converter/src/video.mjs:29`, не приписывая его PR.
- [ ] Зафиксировать policy “warnings fail CI” только после очистки baseline.

### P3-08. Typography custom properties циклически ссылаются на себя

**Где:** `packages/ui-react/src/styles/typography.css:14-15`.

- [ ] Удалить `--font-source-sans: var(--font-source-sans)` и аналогичный Kanit self-cycle.
- [ ] Если нужен alias, использовать разные token/runtime names и `@theme inline` по принятой Tailwind схеме.
- [ ] Добавить CSS consumer smoke для пакета вне web-player, где Next font class не маскирует проблему.

### P3-09. ADR-0020 расходится с фактическим pipeline

**Где:** `apps/docs/docs/architecture/0020-cmaf-range-mse-playback.md:92-116`, consumer `:125-147,399-448`.

- [ ] Отметить target vs transitional state: сейчас создаются Opus, HLS и CMAF, а не заявленные “three objects/no HLS”.
- [ ] Документировать fallback, rollout, storage cost и exit criteria удаления legacy HLS/progressive.
- [ ] Обновить диаграмму и корректный asset link.

### P3-10. `design-qa.md` нерепродуцируем

- [ ] Каждая screenshot reference должна существовать либо быть CI artifact URL.
- [ ] Добавить viewport/theme/seed/command/commit metadata.
- [ ] Не хранить “final” картинки без baseline/update policy.

---

## 13. Аудит удалённых файлов

Ниже не задачи на восстановление, а зафиксированный результат проверки, чтобы случайно не вернуть безопасно удалённый код.

- [x] `apps/web-player/public/images/liked-songs.jpg` заменён `liked-songs.svg`; актуальные ссылки ведут на SVG.
- [x] `PasswordRecoveryForms.tsx` заменён небольшими `ForgotPasswordForm`, `ResetPasswordForm`, `VerifyEmailForm` и barrel.
- [x] Старые login/registration validation files перенесены в `entities/User/model/auth.schema.ts`.
- [x] Старые search mocks заменены live API path.
- [x] `shared/hooks/useArtist.ts` и `useArtists.ts` заменены entity API hooks; remaining imports не найдены.
- [x] `RightSidebar/FavoriteTracks.tsx` не имел consumer; его обязанности не требовали восстановления.
- [x] `MainPanel/LikedPlaylist.tsx` удалён вместе с перестройкой MainPanel; remaining imports нет.
- [ ] После будущего cleanup повторно прогнать `rg`/typecheck/knip, чтобы removal orphan files из P3-05 не удалил dynamic import.

---

## 14. Большие файлы и план декомпозиции

Число строк само по себе не defect. Разделять нужно там, где уже смешаны независимые state machines/транзакционные границы.

### 14.1 `streamLoader.ts` — 419 строк, новый и без integration spec

- [ ] Сначала зафиксировать lifecycle tests из P1-25/26/27, затем рефакторить.
- [ ] Выделить `MediaSourceLifecycle` — sourceopen/error/close/destroy/object URL.
- [ ] Выделить `FragmentTransport` — authenticated Range, validation, retry/abort.
- [ ] Выделить `BufferScheduler` — next fragment, seek, buffered window, EOS.
- [ ] Выделить `BitrateController` — ABR/manual policy и throughput memory.
- [ ] Оставить thin orchestrator с явными state transitions.
- [ ] Не разносить код до тестов: иначе correctness bugs потеряются между слоями.

### 14.2 `audio-processing.consumer.ts` — 502 строки

- [ ] Выделить encoder/package validation service.
- [ ] Выделить generation-scoped storage publisher с bounded concurrency/cleanup.
- [ ] Выделить CAS database finalizer/state machine.
- [ ] Отделить retry/DLQ telemetry и temp workspace lifecycle.
- [ ] Запретить service methods, которые одновременно кодируют, публикуют и меняют canonical DB state.

### 14.3 `tracks.service.ts` — 609 строк

- [ ] Разделить read catalog queries/cache, legacy streaming, upload/write orchestration и queue submission.
- [ ] Общую file/bitrate validation вынести из create/update duplication.
- [ ] Сохранить public API/controller contract во время split.

### 14.4 `seed.service.ts` — 652 строки

- [ ] Разделить domain seed phases: identities/catalog/relations/product data.
- [ ] Верхний orchestrator должен задавать порядок/idempotency, а не содержать все mutations.
- [ ] Добавить deterministic seed/reseed test и rollback/cleanup semantics.

### 14.5 `search.service.ts` — 294 строки с повторяющимся SQL

- [ ] Выделить per-entity repository/query builder только там, где это уменьшит duplication count/search filters.
- [ ] Сохранить `Prisma.sql` parameterization; не строить raw string SQL.
- [ ] Сначала определить pagination contract P2-07.

### 14.6 Файлы, которые не следует дробить механически

- [x] `packages/contracts/src/api/v1.ts` — 16,596 строк, generated.
- [x] `apps/api/prisma/schema.prisma` — 767 строк; split возможен только как отдельное решение Prisma multi-file schema, не ради line count.
- [ ] Foundation migration 793 строки нужно разделить не ради style, а ради deploy stages из P1-31.

---

## 15. Дополнительные UI/quality fixes, которые не должны потеряться

- [ ] `AboutArtist` duplicate priority image — закрывается P2-42.
- [ ] Hover next/previous должен использовать authoritative transition — закрывается P1-29.
- [ ] Profile menu Support/Download anchors — закрывается P2-40.
- [ ] `CreatePlaylistMenu` fixed coordinates/focus — закрывается P2-38.
- [ ] `ServiceWorkerRegistration` catch — закрывается P2-46.
- [ ] Search dropdown combobox — закрывается P2-36.
- [ ] Burger inert/focus — закрывается P2-37.
- [ ] False verified badge — закрывается P2-41.
- [ ] Library action-specific accessible names — закрывается P2-43.
- [ ] Hardcoded locale strings/document lang — закрывается P2-44.

---

## 16. Рекомендуемая последовательность исправлений

### Phase A — containment и release unblock

- [ ] Закрыть P0-01 secret disclosure; принять incident decision.
- [ ] Убрать generated binary artifacts.
- [ ] Обновить branch, разрешить conflict.
- [ ] Исправить clean typecheck и запустить CI на новом SHA.

### Phase B — auth и contract integrity

- [ ] Исправить P1-01…P1-13.
- [ ] Исправить P1-14…P1-19 и regenerate contracts.
- [ ] Запустить auth/browser/contract E2E.

### Phase C — migration и CMAF safety

- [ ] Пересобрать migration rollout P1-31/P1-02.
- [ ] Внедрить CMAF generations/CAS P1-20/21.
- [ ] Исправить Range/manifest/loader P1-22…P1-28.
- [ ] Добавить fault-injection и MSE browser tests.

### Phase D — player/domain behavior

- [ ] Внедрить единый playback transition P1-29 и shuffle context P1-30.
- [ ] Исправить library/search/settings/state findings P2-24…P2-33.
- [ ] Пройти a11y/keyboard P2-34…P2-44.

### Phase E — operations, cleanup и decomposition

- [ ] Закрыть backend scale/observability P2-03…P2-23.
- [ ] Закрыть PWA/config P2-45…P2-49.
- [ ] Закрыть repo/dead code P2-50/P3.
- [ ] Выполнить responsibility-based split только после regression tests.

### Рекомендация по размеру PR

Текущий PR одновременно меняет schema/data migration, auth/security, generated contracts, API, CMAF storage protocol, MSE player, почти весь UI, PWA и design artifacts. Даже после фиксов один review/rollback unit остаётся слишком широким.

- [ ] Предпочтительно разложить на reviewable series: migration expand; backend contracts/auth; CMAF backend; CMAF client; product APIs; UI polish/PWA; cleanup/design assets.
- [ ] Если split невозможен, предоставить dependency graph, feature flags, deploy order, compatibility matrix и rollback plan для каждого слоя.
- [ ] Не включать irreversible contract/drop migration в тот же atomic release без dual compatibility.

---

## 17. Definition of Done перед повторным approval

### Security

- [ ] Ни один public/self endpoint не отдаёт credentials/TOTP/internal auth state.
- [ ] Выполнена и задокументирована ротация, если vulnerable build был развёрнут.
- [ ] Upload XSS regression test зелёный.
- [ ] Deleted accounts и revoked sessions не авторизуются.
- [ ] Cross-origin cookie/CSRF scenario проверен на production-like domains.

### Database/deploy

- [ ] Migration rehearsal выполнен на копии с legacy sessions и relation data.
- [ ] Row counts/FK/duplicates/order reconciliation приложены к PR.
- [ ] Старый и новый app version проверены на совместимых schema stages.
- [ ] Roll-forward/rollback runbook reviewed владельцем инфраструктуры.

### API/contracts

- [ ] OpenAPI fetch failure возвращает non-zero.
- [ ] Generated contracts не имеют diff после запуска API.
- [ ] Runtime responses проходят OpenAPI/Zod contract suite.
- [ ] Pagination totals/order/nullability/IDs проверены на multi-page fixtures.

### Player/media

- [ ] Concurrent CMAF job publication test зелёный.
- [ ] Range protocol tests 200/206/416/mismatch зелёные.
- [ ] Browser MSE tests startup/retry/fallback/EOS/seek зелёные.
- [ ] Queue/repeat/shuffle/prefetch matrix зелёная.
- [ ] Track replacement same ID не использует stale manifest/rendition.

### UI/a11y/PWA

- [ ] Auth registration/login/OAuth/2FA/verify/reset browser flows зелёные.
- [ ] Keyboard-only smoke: player buttons, slider, menu, combobox, burger, focus restore.
- [ ] SW deploy/update/offline/cache ownership tests зелёные.
- [ ] Library/search/public profile/settings проверены с real API envelopes и error states.
- [ ] Locale smoke пройден для en/uk/ru/pl/de.

### Repository/CI

- [ ] Нет merge conflict; required checks зелёные на последнем SHA.
- [ ] Fresh checkout typecheck проходит до build.
- [ ] Biome без новых warnings; `git diff --check` проходит.
- [ ] Unit, integration, API e2e, web E2E, screenshot и production Docker builds зелёные.
- [ ] `knip` не показывает новые orphan files/undeclared direct dependencies.
- [ ] `output/playwright`, orphan PNG и uncontrolled generated Pencil images отсутствуют в Git diff.
- [ ] Никакого commit от ревью-агента не создано.

### Команды финальной верификации

Выполнять из clean checkout с документированными env/service dependencies:

```bash
pnpm install --frozen-lockfile
pnpm exec biome ci apps/api apps/web-player packages/contracts packages/converter packages/ui-react
pnpm --filter @spotify/web-player check-types
pnpm --filter @spotify/web-player test
pnpm --filter @spotify/converter test
pnpm --filter @spotify/api db:gen
pnpm --filter @spotify/api test
pnpm --filter @spotify/api test:int
pnpm --filter @spotify/api test:e2e
pnpm --filter @spotify/web-player test:e2e
pnpm --filter @spotify/web-player test:screenshot
pnpm --filter @spotify/web-player build
pnpm build
pnpm knip
git diff --check origin/develop...HEAD
```

Дополнительно обязательны migration rehearsal, production Docker build и production-like cross-origin browser test: локальный unit suite их не заменяет.

---

## 18. Проверка исправлений Codex (Claude, повторный проход)

Проверка проводилась на рабочем дереве ветки без коммитов: 295 изменённых
файлов, HEAD остался `f72b2f04`.

### Подтверждено закрытым

**P0-01 — утечка секретов артистов.** `PUBLIC_ARTIST_SELECT` заведён и применён
в artists-сервисе и в discovery (`getRelatedArtists` использует
`select: { ...PUBLIC_ARTIST_SELECT, genres }`). Проверено не по коду, а живым
запросом: рекурсивный обход JSON-ответов семи публичных эндпоинтов
(`artists` списком и по id, `related-artists`, `search`, `albums`, `tracks`,
`playlists`) не нашёл ни одного из полей `password`, `twoFactorSecret`,
`email`, `failedLoginAttempts`, `lockedUntil`, `refresh_token`, `access_token`
ни на какой глубине.

**P0-03 — typecheck в чистом checkout.** `web-player` переведён на
`next typegen && tsc --noEmit`. Проверено удалением всего каталога `.next`:
проверка типов проходит с нуля.

### Осталось открытым

**P0-02 — конфликт с develop.** GitHub по-прежнему сообщает `CONFLICTING`,
состояние `DIRTY`. Конфликт в `packages/ui-react/src/styles/palette.css`.

Важное уточнение к плану разрешения: этот файл **генерируется** из
`packages/tokens/tokens.json`. Разрешать конфликт правкой самого CSS нельзя —
первая же команда генерации перезапишет решение. Разводить расхождение нужно в
`tokens.json`, затем перегенерировать.

**Ложное срабатывание в P0-03.** Ошибки в `.next/dev/types/validator.ts` у
`web-artists` вызваны испорченным остатком кэша, а не отсутствием типов: после
удаления `.next` приложение проходит проверку с обычным `tsc --noEmit`. Менять
его скрипт сейчас не требуется, но как только там появится страница с
генерируемым `PageProps`, повторится та же поломка, что была у `web-player`.

### Найдено дополнительно и исправлено

**Удалённый цвет ломал пять компонентов.** Перегенерация палитры убрала
`--color-black-800`. Выяснилось, что этот токен существовал **только как ручная
правка внутри сгенерированного** `palette.css` на develop — в `tokens.json` его
не было никогда. При этом `bg-black-800` продолжает использоваться в экранах
входа и регистрации `web-artists` и в общем компоненте `input`, то есть утилита
перестала давать цвет вообще. Токен объявлен в `tokens.json` и палитра
перегенерирована, поэтому он переживёт любые последующие генерации.

**Ужесточение `expiresAt` было доведено не до конца.** Схема базы переведена с
`DateTime?` на обязательное поле, и миграция написана верно — старые строки
заполняются перед `SET NOT NULL`. Но в коде осталось шесть мест, считавших поле
допускающим `null`: две Swagger-сущности, запрос активных сессий с ветвью
`expiresAt: null`, две фикстуры и один спек. Сборка API падала. Приведено в
соответствие; невозможная ветвь из запроса убрана.

**Регрессия гонки в обработчике аудио.** `markAttemptFailed` был переписан с
атомарной условной записи на «прочитать, проверить, записать». Между чтением и
записью новая загрузка может сменить `audioUrl`, и запись проставит ошибку уже
поверх нового источника — ровно та гонка, от которой остальной CMAF-код в этом
же PR защищается. Возвращена атомарная форма `updateMany` с проверкой источника
внутри условия записи.

**Проверка окружения была привязана к неверному моменту.** `parseWebEnv` и
`getSiteUrl` требовали адреса развёртывания при `NODE_ENV=production`, а
`next build` выставляет его всегда — включая локальную проверку и сборку
образа, который получает конфигурацию при деплое. Сборка была невозможна на
машине без `.env`. Правила сохранены полностью, но включаются там, где
пайплайн реально передаёт значения (в workflow они заданы). Чистые функции и их
тесты не тронуты.

**Недостающие переводы.** В компоненты добавлены девять ключей, которых не было
в словарях (`common.closeMenu`, `common.openMenu`, `common.menu`,
`common.theme`, `common.logOut`, `common.loggingOut`, `profile.updates`,
`profile.caughtUp`, `profile.updatesDescription`). Проверка типов падала.
Добавлены во все пять языков.

**Устаревшие тесты.** Детерминированная сортировка пагинации
(`orderBy: [createdAt desc, id desc]`) добавлена в albums/artists/users, но
ожидания тестов не обновлены — семь падений. Новый тест бургер-меню ожидал
метку `Navigation menu`, тогда как существующий ключ `nav.main` даёт
`Main navigation`. Тесты приведены к реализации.

### Состояние сборки

    pnpm lint          5 задач — успешно
    pnpm check-types   4 задачи — успешно
    pnpm build         9 задач — успешно
    API                49 наборов, 366 тестов
    web-player         44 набора, 209 тестов
    ui-react           81 набор, 258 тестов

Коммитов не делалось.
