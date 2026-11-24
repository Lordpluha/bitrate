---
name: desktop-rules
description: Tauri 2 + React/Vite rules for apps/desktop — the renderer reuses web-player's source through aliases and next/* shims, the loopback origin that keeps cookie auth first-party, the Rust/renderer event and command boundary, the capabilities permission model and the CSP. Use whenever writing or reviewing a file under apps/desktop/, adding a native command or event, or changing tauri.conf.json or a capability file.
paths:
  - "apps/desktop/**"
license: MIT
metadata:
  author: lordpluha
  version: "2.0.0"
---

# Desktop rules — apps/desktop (Tauri 2 + React + Vite)

Read before writing any file in `apps/desktop/`. Pair with the `tauri` skill, which covers
framework mechanics; this file is project law. `apps/desktop/README.md` has the map.

## The renderer is web-player

The renderer imports web-player's FSD layers from `apps/web-player/src` (aliases in
`vite/aliases.ts`, mirrored in `tsconfig.json` `paths`). Consequences:

- **A screen change belongs in web-player**, not in a desktop copy. Never fork a view,
  widget or entity into `apps/desktop`; if desktop needs different behaviour, add a prop or
  a seam in web-player.
- **A new web-player route needs a desktop route**: one `mainScreen(ROUTES.x, View)` line in
  `src/app/router/`, or a `createRoute` with params. Paths come from web-player's `ROUTES`.
- **`next/*` is shimmed** (`src/next-shims`): `Link`, `Image`, `useRouter`, `usePathname`,
  `useSearchParams`. Code reachable from a desktop route must not use anything else from
  Next (`next/headers`, `redirect`, `notFound`, `next/dynamic`, server components, `*.server`
  APIs). `pnpm --filter @bitrate/desktop check-types` fails if it does — keep it that way
  rather than widening the shims silently.
- web-player's page adapters (`app/**/page.tsx`) are not reused; their server-side work
  (metadata, id → username redirects, server data) is redone in the desktop route.
- `@sentry/nextjs` is aliased to `@sentry/react`; only `captureException` may be relied on.
- Desktop-only code (`src/`) uses `@desktop/*`; FSD layer rules do not apply to it.

## Auth needs one origin — never call the API cross-site

The API authenticates only with HttpOnly `SameSite=Lax` cookies. The renderer calls its own
origin (`NEXT_PUBLIC_API_URL` is inlined as `''`); `/api` and `/api-media` are forwarded by
the Vite proxy in dev and by the Rust loopback server (`src-tauri/src/server`) in release.
Do not point the renderer at the API directly, use `tauri-plugin-http` for API calls, or
load the window from `tauri://` — each breaks the session or audio streaming.

The loopback server's `Host` guard, cookie rewrite and fixed port list are security and
state decisions: the port is part of the origin that owns `localStorage`.

## The Rust/renderer boundary

Native → renderer pushes are **events** whose names and payloads live in
`src-tauri/src/events.rs` and `src/native/nativeEvents.ts`; change both together and
validate payloads on the renderer side. Renderer → native calls are **commands**: declared
in Rust, registered in `generate_handler!`, and wrapped once in a typed renderer function —
never `invoke('...')` inline. Rust `snake_case` parameters arrive as `camelCase` from JS.

Prefer handling a native concern entirely in Rust (navigation policy, external links, tray,
deep links and window state are) over granting the renderer a plugin permission.

## Capabilities are security, not configuration

The window loads a non-`tauri://` origin, so `capabilities/default.json` lists it under
`remote.urls`, and grants only `core:event:allow-listen` / `allow-unlisten`. Every
permission added grants the renderer — and anything that ever executes in it — real access
to the user's machine. Add the **narrowest** permission, scope filesystem grants with path
variables, and **state in your report exactly what you widened and why**.

## CSP

Set in `tauri.conf.json` and served by the loopback server for `index.html` (fallback
constant in `server/assets.rs` — keep the two identical). `script-src 'self'` only: no inline
scripts (the theme boot runs in `main.tsx` for that reason). `style-src 'unsafe-inline'` is
there for `<bitrate-player>`'s runtime shadow-root styles; never extend `'unsafe-inline'` or
`*` to scripts or connections to make something load.

## Renderer conventions

React function components, named exports (framework-required default exports in the
`next/*` shims are the exception), named React imports, named types in signature positions,
no production `any`. Design values come from web-player's stylesheet, which the desktop
stylesheet imports — do not add a second token source.

## Commands

```bash
pnpm --filter @bitrate/desktop dev                 # renderer only (Vite, :1420)
pnpm --filter @bitrate/desktop tauri dev           # full app (API on :3000)
pnpm --filter @bitrate/desktop check-types         # tsc -b, includes reused web-player code
pnpm --filter @bitrate/desktop build               # vite build
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Linux needs `pkg-config` and the WebKitGTK/GTK dev packages for any cargo command; if they
or the Rust toolchain are missing, say so rather than reporting a pass. Signed release
builds and code signing are the user's to run.

## Related

- `tauri` skill — invoke, capabilities, events, why Tauri 1 material misleads.
- `.claude/rules/fsd-web-player.md`, `web-player-rules.md` — for the reused layers.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`.
