# Web Player — полный список для редизайна

Собрано напрямую из структуры `apps/web-player/src` (роуты + views + widgets + features).
Ничего не выдумано — это реальные страницы и блоки, которые сейчас существуют в коде.

---

## 1. Публичные страницы (не залогинен, группа `(landing)`)

1. **Landing / главная маркетинговая** — `/`
2. **Login** — `/login` и `/auth/login` (два пути на один экран)
3. **Login → 2FA** — `/login/2fa` и `/auth/login/2fa`
4. **Registration** — `/auth/registration`
5. **Forgot password** — `/auth/forgot-password`
6. **Reset password** — `/auth/reset-password`
7. **Verify email** — `/verify-email`

Плюс модалки поверх лендинга (не отдельные роуты, но отдельные экраны в дизайне):
- **Login modal** (`AuthModal/LoginModal`)
- **Sign up modal** (`AuthModal/SignUpModal`)

---

## 2. Основное приложение (залогинен, группа `main`)

1. **Home / главная плеера** — `/main`
2. **Search** — `/main/search`
3. **Library (моя библиотека)** — `/main/library`
4. **Album** — `/main/album/[id]`
5. **Artist** — `/main/artist/[id]`
6. **Playlist** — `/main/playlist/[id]`
7. **Liked Songs** — `/main/liked-songs`
8. **Podcast** — `/main/podcast/[id]`
9. **Queue (очередь воспроизведения)** — `/main/queue`
10. **Lyrics (текст песни, полноэкранный)** — `/main/lyrics`
11. **Recents (недавнее)** — `/main/recents`
12. **Profile (публичный профиль пользователя)** — `/main/profile`
13. **User (чужой профиль по id)** — `/main/user/[id]`
14. **Preferences** — `/main/preferences`
15. **Settings** — `/main/settings`

Отдельная страница вне групп:
16. **Offline** — `/offline`

---

## 3. Настройки — подэкраны (все внутри `/main/settings`, один view, много секций)

Каждая секция — по сути отдельный "подэкран" в дизайне (аккордеон/таб):

- Account settings (аккаунт)
- Profile details (детали профиля + аватар)
- Privacy settings (приватность)
- Server / data privacy settings
- Playback settings (воспроизведение)
- Audio settings (аудио-качество)
- Video settings
- Library display settings (вид библиотеки)
- Equalizer preview (эквалайзер)
- Active sessions (активные сессии/устройства)
- Two-factor settings (2FA)
- Subscription settings (подписка/план)

---

## 4. Постоянные виджеты (видны почти на каждом экране `/main/*`)

- **Header** (публичный, лендинг)
- **MainHeader** (внутри приложения — поиск, аватар, навигация назад/вперёд)
- **LeftSidebar** — библиотека:
  - LibraryHeader, LibraryControls, LibraryTags
  - LibraryMusicList / LibraryMusic (карточки), LibraryMusicSkeleton (лоадер)
  - CreatePlaylistMenu, CreateMenuItem, CreatePlaylistActions
  - MobileCreatePlaylistSheet (мобильный вариант создания плейлиста)
- **RightSidebar** — контекст трека:
  - NowPlaying / AboutArtist
  - Credits
  - CurrentPlaylist
  - NextInQueue
- **Player** (нижняя панель плеера) — самый сложный виджет:
  - DesktopPlayerBar (десктоп)
  - MiniPlayer / MiniPlayerControls / MiniPlayerTrackInfo (мобильный компакт)
  - FloatingPlayerWindow / FloatingPlayerActions / FloatingPlayerProgress (плавающий/full-screen)
  - NowPlayingView / NowPlayingHero / NowPlayingDetails / NowPlayingFooter (полноэкранный "сейчас играет")
  - PlayerControls / PlayerActions / PlaybackProgress
  - TrackInfo / TrackNavigationButton
- **Footer** (лендинг)
- **Plans / PremiumFeatures** (страница/блок тарифов)
- **QRcode** (виджет для мобильного приложения / оплаты)

---

## 5. Состояния, которые редизайн должен покрыть отдельно (не роуты, но обязательные экраны)

- Пустая библиотека / пустой плейлист (empty state)
- Загрузка (skeleton) — как минимум для LibraryMusicList
- Ошибка / offline (уже есть отдельная страница `/offline`)
- Мобильная версия (реально самостоятельная раскладка — MiniPlayer, MobileCreatePlaylistSheet и т.д. — не просто "сжатый десктоп")
- Тёмная / светлая / dim темы — см. раздел 6

---

## 6. Дизайн-система — что нужно определить/зафиксировать

### Токены (сейчас `packages/ui-react/src/styles/`, hand-written Tailwind v4 `@theme`)
- Палитра (`palette.css`) — базовые raw-цвета
- Семантические роли (`themes/base.css`, `themes/global/*.css`, `themes/components/*.css`)
- Темы: **dark** (дефолт), **light**, **dim** (низкоконтрастный тёмный)
- Типографика (`typography.css`)
- Layout / spacing (`layout.css`)
- Анимации (`animations.css`)

### Компоненты (`packages/ui-react`)
Нужен полный визуальный аудит существующих примитивов — Button, Input/PasswordInput,
Avatar, Badge, Card/Item, Table, Select, Switch, Dropdown/Menu, Dialog/Modal, Tooltip,
Toast, Slider (для прогресса плеера и громкости), Skeleton.

### Формы
- Login form (email + password), с полем 2FA-кода
- Registration form (email step → password step, чек-лист требований к паролю)
- Forgot / reset password
- Profile details (аватар upload, drag&drop)

### Иконография
- Плеер: play/pause, next/prev, shuffle, repeat (off/all/one), volume, queue, lyrics,
  fullscreen/mini toggle
- Библиотека: create playlist, filter/tags, sort
- Настройки: по секции своя иконка

---

## 7. Что нужно решить как продуктовые/UX-вопросы перед стартом редизайна

1. Остаётся ли разделение "публичный лендинг" vs "модалка логина поверх лендинга", или всё
   переходит на отдельные страницы `/auth/login` и `/auth/registration`?
2. Мобильный плеер — три режима (mini / floating / fullscreen NowPlaying) или сокращаем до двух?
3. `/main/preferences` vs `/main/settings` — это два разных экрана или дубли, которые надо
   объединить в редизайне?
4. Тема **dim** — насколько отдельная от dark, или это просто регулировка яркости surface-токенов?
5. Равноправны ли web-player и web-artists в новой дизайн-системе, или у web-player сейчас
   приоритет (артист-портал отдельным заходом)?

---

*Файл сгенерирован по факту структуры `apps/web-player/src` на develop.
Дальше сюда можно добавлять референсы из Pencil-файлов (`pencil/*.pen`) и финальные макеты.*
