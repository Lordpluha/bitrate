# Web Player — Complete Redesign Inventory

Compiled directly from `apps/web-player/src` (routes, views, widgets, and features).
This document describes existing product surfaces; it does not invent new functionality.

## 1. Public pages (signed out, `(landing)` group)

1. **Landing / marketing home** — `/`
2. **Login** — `/login` and `/auth/login` (two paths to the same screen)
3. **Login → 2FA** — `/login/2fa` and `/auth/login/2fa`
4. **Registration** — `/auth/registration`
5. **Forgot password** — `/auth/forgot-password`
6. **Reset password** — `/auth/reset-password`
7. **Verify email** — `/verify-email`

Landing overlays that require dedicated designs even though they are not routes:

- **Login modal** (`AuthModal/LoginModal`)
- **Sign-up modal** (`AuthModal/SignUpModal`)

## 2. Main application (signed in, `main` group)

1. **Home / player home** — `/main`
2. **Search** — `/main/search`
3. **Library** — `/main/library`
4. **Album** — `/main/album/[id]`
5. **Artist** — `/main/artist/[id]`
6. **Playlist** — `/main/playlist/[id]`
7. **Liked Songs** — `/main/liked-songs`
8. **Podcast** — `/main/podcast/[id]`
9. **Queue** — `/main/queue`
10. **Lyrics (full screen)** — `/main/lyrics`
11. **Recents** — `/main/recents`
12. **Profile (the listener's public profile)** — `/main/profile`
13. **User (another listener's profile)** — `/main/user/[id]`
14. **Preferences** — `/main/preferences`
15. **Settings** — `/main/settings`
16. **Offline** — `/offline` (outside the route groups)

## 3. Settings subsections

All of these surfaces live inside `/main/settings`. The current application presents them as
sections of one view, but each needs its own design state:

- Account settings
- Profile details and avatar
- Privacy settings
- Server and data-privacy settings
- Playback settings
- Audio-quality settings
- Video settings
- Library display settings
- Equalizer preview
- Active sessions and devices
- Two-factor authentication
- Subscription and plan settings

## 4. Persistent widgets

These widgets appear on most `/main/*` screens:

- **Header** — public landing header.
- **MainHeader** — application search, avatar, and back/forward navigation.
- **LeftSidebar** — library navigation:
  - `LibraryHeader`, `LibraryControls`, and `LibraryTags`;
  - `LibraryMusicList`, `LibraryMusic`, and `LibraryMusicSkeleton`;
  - `CreatePlaylistMenu`, `CreateMenuItem`, and `CreatePlaylistActions`;
  - `MobileCreatePlaylistSheet` for the mobile playlist flow.
- **RightSidebar** — current-track context:
  - `NowPlaying` and `AboutArtist`;
  - `Credits`;
  - `CurrentPlaylist`;
  - `NextInQueue`.
- **Player** — the most complex persistent widget:
  - `DesktopPlayerBar`;
  - `MiniPlayer`, `MiniPlayerControls`, and `MiniPlayerTrackInfo`;
  - `FloatingPlayerWindow`, `FloatingPlayerActions`, and `FloatingPlayerProgress`;
  - `NowPlayingView`, `NowPlayingHero`, `NowPlayingDetails`, and `NowPlayingFooter`;
  - `PlayerControls`, `PlayerActions`, and `PlaybackProgress`;
  - `TrackInfo` and `TrackNavigationButton`.
- **Footer** — public landing footer.
- **Plans / PremiumFeatures** — plan and feature surface.
- **QRcode** — mobile-app or payment handoff.

## 5. Required non-route states

- Empty library and empty playlist.
- Loading and skeleton states, at minimum for `LibraryMusicList`.
- Error and offline states; `/offline` already exists as a dedicated route.
- Mobile layouts. `MiniPlayer` and `MobileCreatePlaylistSheet` are independent compositions,
  not compressed desktop screens.
- Dark, light, and dim themes; see the design-system section below.

## 6. Design-system scope

### Tokens

The current token source lives under `packages/ui-react/src/styles/` and uses handwritten
Tailwind v4 `@theme` declarations.

- Raw color palette: `palette.css`.
- Semantic roles: `themes/base.css`, `themes/global/*.css`, and
  `themes/components/*.css`.
- Themes: **dark** (default), **light**, and **dim** (low-contrast dark).
- Typography: `typography.css`.
- Layout and spacing: `layout.css`.
- Motion: `animations.css`.

### Components

Audit the existing `packages/ui-react` primitives: Button, Input, PasswordInput, Avatar, Badge,
Card, Item, Table, Select, Switch, Dropdown/Menu, Dialog/Modal, Tooltip, Toast, Slider, and
Skeleton. Progress and volume controls must use the same system.

### Forms

- Login with email, password, and a 2FA-code state.
- Registration with email and password steps plus a password-requirements checklist.
- Forgot-password and reset-password flows.
- Profile details with avatar upload and drag-and-drop states.

### Iconography

- Player: play/pause, next/previous, shuffle, repeat (off/all/one), volume, queue, lyrics, and
  full-screen/mini toggles.
- Library: create playlist, filters/tags, and sorting.
- Settings: a distinct icon for each section.

## 7. Product and UX decisions still required

1. Keep both a public landing and a login modal, or consolidate authentication on
   `/auth/login` and `/auth/registration`?
2. Keep three mobile-player modes (mini, floating, and full-screen Now Playing), or reduce them
   to two?
3. Are `/main/preferences` and `/main/settings` distinct products or duplicates to consolidate?
4. Is **dim** a distinct theme or a brightness adjustment of dark surface tokens?
5. Do web-player and web-artists have equal design-system priority, or is web-player the current
   primary product?

This inventory reflects the `apps/web-player/src` structure on `develop`. Add approved Pencil
references and final mockups here as the redesign progresses.
