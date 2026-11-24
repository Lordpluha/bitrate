# @bitrate/desktop

The Bitrate player as a native desktop app (Tauri 2). It renders web-player's own screens,
shell and player, so the two surfaces look and behave the same, and adds what a desktop app
needs: a tray, hide-to-tray, one running instance, a remembered window, external links in the
system browser, and `bitrate://` links.

## How it fits together

```
apps/desktop/
  index.html, src/        Vite + React renderer
    main.tsx              entry: theme, providers, router, native bridge
    app/router/           TanStack Router tree — one route per web-player page.tsx
    app/providers/        web-player's provider stack minus service worker and devtools
    next-shims/           next/link, next/navigation, next/image over TanStack Router
    native/               typed listeners for the shell's tray and deep-link events
  vite/                   aliases, process.env inlining, dev API proxy
  src-tauri/src/
    lib.rs                plugins, setup, run loop
    server/               loopback server: renderer assets + API proxy, Host guard
    window/               main window, navigation policy, hide on close
    tray.rs, events.rs    tray menu and the renderer event contract
    deep_link/            bitrate:// allowlist and routing
```

**Reuse.** The renderer imports web-player's `views`, `widgets`, `features`, `entities` and
`shared` straight from `apps/web-player/src` (aliases in `vite/aliases.ts`, mirrored in
`tsconfig.json`). The `next/*` modules that code imports resolve to `src/next-shims`. A fix
or a new screen in web-player therefore reaches desktop on the next build; a new web-player
*route* needs one line in `src/app/router/`.

**Auth and the API.** The API authenticates with HttpOnly `SameSite=Lax` cookies only, so the
renderer never calls it cross-site. Every request goes to the renderer's own origin:

| Mode | Origin | `/api`, `/api-media` forwarded by |
|---|---|---|
| `tauri dev` | `http://localhost:1420` (Vite) | Vite proxy → `VITE_API_URL` |
| release | `http://127.0.0.1:47810` (first free of 47810–47815) | Rust loopback proxy → `BITRATE_API_URL` (build time) |

The loopback proxy strips `Domain` and `Secure` from the API's cookies (the loopback hop is
plain HTTP on the user's own machine; the hop to the API keeps TLS), rewrites redirects back
to the API, and rejects any `Host` other than its own (DNS-rebinding guard).

**Security.** The renderer may only listen to the shell's events
(`capabilities/default.json`); links, tray, deep links and window state are handled in Rust.
The CSP (`tauri.conf.json`, also sent by the loopback server) allows scripts from `'self'`
only. `style-src` includes `'unsafe-inline'` because `<bitrate-player>`'s Svelte custom
elements inject `<style>` into their shadow roots at runtime.

## Requirements

**Linux (Ubuntu/Debian):**
```bash
sudo apt install -y pkg-config libwebkit2gtk-4.1-dev build-essential libssl-dev \
  libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**macOS:** `xcode-select --install`, then rustup as above.

**Windows:** WebView2 (preinstalled on Windows 11) and rustup with the MSVC toolchain.

## Run and build

```bash
# from the repo root — the renderer needs the built shared packages
pnpm install
pnpm turbo run build --filter=@bitrate/ui-react --filter=@bitrate/player

# API running on :3000 (see the root README), then:
pnpm --filter @bitrate/desktop tauri dev          # native window + Vite HMR
pnpm --filter @bitrate/desktop dev                # renderer only, in a browser

# release build against a deployed API
BITRATE_API_URL=https://api.example.com pnpm --filter @bitrate/desktop tauri build
```

## Checks

```bash
pnpm --filter @bitrate/desktop check-types        # renderer + reused web-player code
pnpm --filter @bitrate/desktop build              # vite build
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Deep links

| Link | Opens |
|---|---|
| `bitrate://` | home |
| `bitrate://album/<id>`, `playlist/<id>` | album, playlist |
| `bitrate://artist/<username>`, `user/<username>` | artist page, listener profile |
| `bitrate://search?q=<query>` | search |
| `bitrate://library`, `liked-songs`, `queue`, `charts`, `recents`, `notifications`, `friends`, `stats` | that screen |

Anything else is ignored.

## Known limits

- **Google/Facebook sign-in** does not complete inside the app yet: the provider's page opens
  in the system browser, whose cookies the app cannot see. Email + password and 2FA work.
  Finishing OAuth needs an API hand-off (a one-time code returned to `bitrate://auth/...`).
- No offline mode or downloads yet (not started on any surface).
- Release builds are unsigned; signing and notarisation are the maintainer's to set up.
