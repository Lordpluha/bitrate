# Чек-лист №1 — Фронтенд (`apps/web-player`)

> Дата анализа: 2026-08-02 · ветка `fix/web-player-visual-polish`
> **Обновлён 2026-08-10 после quality-прохода** — закрыты декомпозиция UI, a11y, компонентные и browser-тесты, цветовые токены и metadata динамических страниц.
> **Обновлён 2026-08-11 после расширения API** — frontend подключён к новым discovery, podcast, me, auth, user-follow и moderation endpoint-ам.
> Плеер (аудио-движок, HLS, слоты) намеренно **не рассматривается** — по договорённости, позже.
> Существующий frontend-only i18n в этом проходе не изменялся.
> Отмечено: 🔴 блокер клона · 🟠 важно · 🟡 качество/долг
> `[x]` — сделано · `[ ]` — осталось (причина указана)

---

## 1. Отсутствующие страницы и маршруты

- [x] 🔴 **Страница артиста** `/main/artist/[id]` — сделана.
      Новый слайс `views/Artist/` (hero с фоном, play/shuffle/follow, Popular с «See more»,
      дискография-грид, About), `ROUTES.artist(id)`, `loading.tsx`, `not-found.tsx`.
      Каталог артиста фильтруется на клиенте — у API нет artist-scoped списков (см. чек-лист №2).
- [x] 🔴 **Slice `entities/Artist`** — создан.
      `api/client/hooks.ts` (`useArtists`, `useArtist`, `useFollowedArtists`, `useFollowArtist`,
      `useUnfollowArtist`), `lib/useIsFollowingArtist`, `ui/{FollowArtistButton,ArtistLink,ArtistName}`,
      zod-схемы, барель. `shared/hooks/useArtist.ts` и `useArtists.ts` удалены, все импорты переписаны.
- [x] 🟠 **Вкладки по типам в поиске** — сделано (`SearchFilterTabs`: All / Songs / Artists /
      Albums / Playlists / Profiles, показываются только непустые).
- [x] 🟠 **`error.tsx` / `not-found.tsx` / `loading.tsx`** — добавлены
      `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/main/error.tsx`,
      `loading.tsx` для `album/[id]`, `user/[id]`, `search`, `library`, `artist/[id]`.
      Общий компонент `shared/ui/ErrorState.tsx`.
- [x] 🟡 ~~Дублирование логина~~ — **пункт был неверным.** `app/(landing)/login/` и
      `login/2fa/` — это не дубли экранов, а redirect-шимы для OAuth-колбэков.
      Исправлено другое: в `login/2fa` был инлайн-путь вместо `ROUTES.auth.twoFactorLogin`.

## 2. Моки и «мёртвый» код

- [x] 🔴 **Browse/категории, чарты и recommendations** — переведены на API.
      Новый слайс `entities/Discovery` валидирует ответы Zod-схемами и даёт React Query hooks
      для `/browse/categories`, category playlists, feed, charts и personal top. `SearchPage`,
      `CategoryPage` и `MainPanel` берут реальные данные; моковые category rows больше не являются источником UI.
- [x] 🔴 **`Credits.tsx`** — переписан на реальные данные: главный артист текущего трека,
      ссылка на его страницу, рабочая кнопка Follow. Захардкоженные «Crystal Castles» / «Van She»
      удалены. Блок включён обратно в `RightSidebar` (был закомментирован) и виден в `NowPlayingView`.
- [x] 🟠 **`PopularArtists`** — подключён в `MainPanel`, относительный импорт `../../../shared/ui`
      заменён на `@shared/ui`, удалена кнопка «Show all», которая никуда не вела.
- [x] 🟠 **Табы `All / Music / Podcasts`** реально фильтруют контент.
      Podcasts теперь показывает API-каталог и сохранённые выпуски. Добавлены страница
      `/main/podcast/[id]`, episode list и save/unsave через `/me/episodes`. Воспроизведение выпусков
      намеренно не добавлялось: плеер вынесен в отдельную задачу.
- [x] 🟠 `AboutArtist.tsx` — проверен, данные настоящие. `FavoriteTracks.tsx` оказался
      неиспользуемой копией `CurrentPlaylist` — удалён.
- [x] Дополнительно: `track.artistId` больше не течёт в UI как сырой id — везде
      `<ArtistName>` / `<ArtistLink>` (`TrackCard`, `AlbumPage`, `NextInQueue`, выдача поиска).

## 3. Настройки (`views/Settings`)

- [x] 🔴 **Все переключатели сохраняются между перезагрузками.**
      Новый слайс `entities/Settings`: `settingsStore` + `useSettingsPersistence`
      (гидрация из localStorage после монтирования → без hydration mismatch),
      подключён в `app/_provider.tsx`. Все секции переведены с `useState` на стор.
- [x] 🟠 **Два переключателя получили реальный эффект:**
      - `compactLibrary` → дефолтный `viewMode` у `TracksList` и стартовый режим в `PlaylistContent`.
      - `nowPlayingPanel` → показ правого сайдбара (`useMainShellResize.hasRightSidebar`).
- [x] 🔴 **Frontend-only i18n** — добавлен типизированный `shared/i18n`
      без новой зависимости: `I18nProvider`, English fallback, интерполяция
      параметров и строгие ключи словаря. Языки: English, Українська, Русский,
      Polski, Deutsch. Выбор хранится в settings-store, переживает reload и обновляет
      `document.documentElement.lang`. Переведены settings, main/discovery, library, search,
      playlist/liked, queue, recents, mobile navigation и основные track-actions.
- [ ] 🟠 `streamingQuality`, `normalizeVolume` — значение сохраняется, но эффекта нет:
      качество упирается в выбор варианта HLS, нормализация — в Web Audio `GainNode`.
      И то и другое — аудио-движок, вынесенный за скобки.
- [x] 🟠 **Server settings** — `compactLibrary`, `showNowPlaying`, `explicitContent`
      и `privateSession` читаются и записываются через `/me/settings`; после mutation React Query
      получает обновлённые данные без лишнего refetch. Язык и audio-настройки в этом проходе
      не трогались. Video-поля остаются frontend-only, так как таких полей в DTO бэка нет.
- [x] 🟠 **Subscription и account state** — в Settings выводятся тариф/статус из `/me/subscription`,
      статус email verification и список активных сессий с возможностью завершить нетекущую сессию.
- [x] 🟠 Кнопка «Import library», которая ничего не делала, удалена.
- [x] 🟡 **Search settings** — лупа открывает поле поиска, секции фильтруются
      по переведённому заголовку и search terms; `Escape` и кнопка закрытия
      сбрасывают поиск.

## 4. Плеер-смежное (состояние/UX, не аудио-движок)

- [x] 🔴 **Очередь воспроизведения** — полноценная сущность в `playerStore`:
      `queue`, `addToQueue`, `playNext`, `removeFromQueue`, `clearQueue`.
      `changeTrack('next')` сначала расходует очередь, потом идёт по контексту.
      Экран `/main/queue` (Now playing / Next in queue / Next from: …), кнопка «+» на каждом
      треке в списке, обновлённый виджет «Next in queue» со ссылкой на экран.
- [x] 🔴 **Repeat** — режимы `off / all / one`:
      кнопка в `PlayerControls` (иконка `Repeat1` для «one»), горячая клавиша `R`,
      `advanceOnTrackEnd()` для авто-перехода. При `off` плейлист больше не зациклен —
      воспроизведение останавливается на последнем треке.
- [x] 🟠 **Тексты песен** — экран `/main/lyrics` на поле `Track.lyrics`,
      кнопка-микрофон в панели плеера теперь ведёт туда (была мёртвой).
      Кнопка «устройства» (`MonitorSpeaker`) удалена — Spotify Connect требует бэка.
- [x] 🟠 **Play history** — страница Recents сгруппирована по датам, добавлены
      удаление одного трека и очистка истории через уже готовые API hooks.
- [x] 🟡 `changeTrack` больше не зациклен безусловно — зависит от repeat-режима.
      Существующий тест `playerStore.unit-spec.ts` обновлён под новое поведение.

## 5. Интеграция с API

- [x] 🟠 `useSearch` запрашивает и артистов тоже; они выводятся отдельной вкладкой
      и в общей выдаче (круглые аватарки, ссылка на страницу артиста).
- [x] 🟠 Follow/unfollow артиста — `FollowArtistButton`, используется на странице артиста
      и в блоке Credits.
- [x] 🟠 Лайк альбома — вынесен в `entities/Album/ui/LikeAlbumButton.tsx`, подключён в `AlbumPage`.
      Ограничение: API не отдаёт «лайкнут ли альбом», состояние живёт в рамках сессии —
      задокументировано в TSDoc компонента.
- [x] 🟠 **Загрузка аватара из UI** — реализована в Profile settings через
      `useUploadUserAvatar`, с обновлением user-query и friendly error toast.
- [x] 🟡 `apiQueryKeys.artists` добавлены.
- [x] 🟠 **Search history** — поиск валидирует новый response-wrapper, recent queries
      читаются из `/search/history`, а clear-action удаляет историю на сервере.
- [x] 🟠 **Notifications** — desktop и mobile header показывают серверные уведомления,
      unread count, mark-one-read и mark-all-read.
- [x] 🟠 **Email verification и sessions** — после регистрации открывается
      `/verify-email`; форма подтверждает token и умеет повторно запросить email. Settings дают
      просмотреть и отозвать сессии.
- [x] 🟠 **User follows и personal statistics** — на public profile есть follow/unfollow,
      на своём профиле — following users, реальные top artists/tracks; страница артиста
      показывает related artists из API.
- [x] 🟠 **Moderation reports** — для чужого плейлиста добавлена форма report
      с reason/details, валидацией и friendly toast feedback.

## 6. Нарушения правил проекта

- [x] 🟠 **`//`-комментарии** — было 40, осталось 2 (`biome-ignore`-директивы, они обязаны быть `//`).
      Остальные переведены в TSDoc; в `proxy.ts` заодно удалён закомментированный мёртвый код.
- [x] 🟠 **Относительные импорты через границы слайсов** — 0.
      Схемы `loginSchema`/`registrationSchema` перенесены в `entities/User/model/auth.schema.ts`
      (как требует `forms.md`), что заодно убрало нарушение FSD-3 `AuthModal → Login/Registration`
      и дублирование схем. `nav-links.json` импортируются через `@widgets/...`.
- [x] 🟡 **Hex в `app/global.css`** — вынесены в `@theme` как токены
      (`--color-scrollbar-thumb`, `--color-auth-gradient-*`). `WaveAnimated` переведён
      на `currentColor` + `text-green-500` вместо пропа `color = '#1db954'`.
- [x] 🟡 **Magic hex-цвета дочищены.** Цвета browse-категорий вынесены
      в `app/global.css` как `--color-browse-*`, а `search.constants.ts` и `CategoryPage`
      используют токены. В `.tsx` остались только официальные цвета OAuth-брендов;
      литералы в `manifest.ts` / `layout.tsx` оставлены как platform metadata.
- [x] 🟠 **Крупные UI/оркестрационные файлы декомпозированы.** `SearchPage`, `LibraryPage`,
      `PlaylistPage`, `ProfilePage`, `SettingsPage`, sidebar/header/player-виджеты и store разделены
      на UI, model/hooks, types и helpers. Последние крупные UI-остатки тоже разделены:
      `PlaylistMenus` → `PlaylistMenuItem`, `TrackContextMenu` → `useTrackContextMenu`.
      Не дробятся словари/константы, spec-файлы и отложенный аудио-движок: там лимит
      строк не означает большой React-компонент.

## 7. Тесты

- [x] Unit-набор: **12 spec-файлов / 49 тестов**, все зелёные.
      К сторам и чистым функциям добавлены компонентные тесты всех слоёв:
      `TrackPlayIndicator` (entity), `SearchFilterTabs` (feature), `PlaybackProgress` (widget),
      `PlaylistLoadStates` (view). Проверяются accessible name, keyboard navigation,
      slider semantics, loading/error live regions и retry.
- [x] 🟠 **Playwright расширен.** E2E: landing + auth validation/navigation
      (`3` сценария в `2` файлах, desktop/mobile projects). Screenshot: landing desktop +
      login mobile, добавлен baseline `login-mobile-chromium-linux.png`.

## 8. PWA / платформенное

- [x] 🟠 **PWA** — `app/manifest.ts` (standalone, `start_url: /main`, shortcuts на Search /
      Library / Liked Songs), иконка `public/icon.svg`, `themeColor` через `export const viewport`.
      Кнопка «Install app» теперь опирается на настоящий манифест.
- [x] 🟡 `app/robots.ts` (закрывает `/main/` и `/auth/`) и `app/sitemap.ts` (публичные роуты).
- [x] 🟡 `metadataBase` + шаблон заголовка `%s · Spotify clone`, `export const metadata`
      на разделах (Library, Search, Settings, Profile, Recents, Queue, Lyrics, Liked Songs).
- [x] 🟡 **Динамические metadata** для `album/[id]`, `artist/[id]`, `playlist/[id]`.
      Добавлены узкие server API-классы и общий `buildEntityMetadata`: title, description,
      canonical, Open Graph/Twitter image берутся из сущности; при ошибке API есть fallback.
- [x] 🟡 **Service worker / offline fallback** — `public/sw.js` регистрируется только
      в production. Навигация использует network-first и падает на `/offline`; same-origin
      статика кешируется, API/auth/audio запросы намеренно не кешируются.

## 9. Доступность и UX-механика

- [x] 🟠 **Горячие клавиши** — `widgets/Player/model/usePlayerHotkeys.ts`:
      Space — play/pause, ←/→ — перемотка ±5с, Ctrl/Cmd+←/→ — трек назад/вперёд,
      ↑/↓ — громкость, `M` — mute, `S` — shuffle, `R` — repeat.
      Не срабатывают, когда фокус в input/textarea/contenteditable.
- [x] 🟠 **Контекстное меню трека** — открывается правым кликом и `Shift+F10`,
      закрывается по `Escape`/клику снаружи. Действия: play/pause, add to queue и
      remove from playlist там, где у списка есть право удаления.
- [ ] 🟠 Drag & drop треков — в БД и read/add logic уже есть `position`,
      но нет mutation endpoint для перестановки. До появления batch reorder API frontend не сможет
      надёжно сохранять drag & drop после reload.
- [x] ~~Нет системы тостов~~ — **пункт был неверным**: тосты есть
      (`shared/api/feedback.ts` + `Toaster` из `@spotify/ui-react`). Новые действия
      (очередь, follow, лайк альбома) к ним подключены.
- [x] 🟡 **A11y code-аудит по `apps/docs/docs/brand/a11y.md`.** Добавлен единый
      `:focus-visible`, поддержка `prefers-reduced-motion`, accessible names для icon-only controls,
      `aria-live`/`role=alert` для статусов, keyboard navigation для tabs/menu/select.
      `useOverlayFocus` переводит фокус в modal/sheet, ловит `Escape`, не выпускает фокус
      и возвращает его на trigger. Формы сохраняют label/error semantics.
      Клавиатурное поведение Search tabs и auth-формы закреплено тестами.

---

## Проверки после изменений

```
pnpm --filter @spotify/web-player check-types                 → 0 ошибок
pnpm --filter @spotify/web-player exec biome check src tests/e2e → 496 файлов, чисто
pnpm --filter @spotify/web-player test:unit                  → 12 файлов, 49 тестов
Playwright auth (Chromium)                                   → 2/2 сценария
Playwright login mobile screenshot                           → 1/1, baseline создан
```

> Полный build и весь Playwright-набор не запускались: запущены только новые browser-сценарии.

### Проверка API-интеграции 2026-08-11

```
pnpm --filter @spotify/web-player exec biome check <новые API/UI файлы> → 33 файла, чисто
pnpm --filter @spotify/web-player check-types → production-код чист;
  остались только устаревшие Track fixtures в 2 player unit-spec файлах
```

> Player fixtures не исправлялись: плеер намеренно исключён из текущей задачи.

## Что осталось и почему

| Пункт | Причина |
|---|---|
| Качество стриминга, нормализация громкости | аудио-движок, вынесен за скобки |
| Video settings — серверная синхронизация | полей нет в `/me/settings`; пока хранятся локально |
| Drag & drop, порядок треков | нужен playlist reorder endpoint; `position` в БД уже ест |
| Ручной screen-reader/400% zoom прогон | требует проверки человеком в конкретном browser/OS |
