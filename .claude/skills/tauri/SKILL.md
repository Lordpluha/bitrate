---
name: tauri
description: Tauri 2 conventions for apps/desktop — the Rust/renderer boundary and typed invoke wrappers, the capabilities permission model, CSP, state management across the boundary, and why Tauri 1 material online does not apply. Use when adding a native command, changing tauri.conf.json or a capability file, or when invoke fails or an asset will not load.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Tauri 2 — apps/desktop

A Rust native shell (`src-tauri/`) wrapping a React + Vite renderer.

## Read this first — two traps

**1. `apps/desktop` is scaffolded but unstarted** (roadmap v1.2.0, per `PRODUCT.md`), close
to the `create-tauri-app` React template. `.claude/rules/desktop-rules.md` is its law — read
it alongside this skill; it also records that `tauri.conf.json` ships `"csp": null` today.
Next.js-only conventions — FSD layers, `'use client'`, `app/**/page.tsx` adapters — mean
nothing in a Vite SPA. Flag any convention you had to improvise.

**2. Most Tauri material online is v1.** The v2 API, permission model, and plugin system all
changed. Read the installed `@tauri-apps/api` types and the v2 documentation; a v1 snippet
will typically fail at build time, or worse, silently need a permission it never mentions.

## The boundary

Rust exposes commands; the renderer calls them:

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn get_audio_devices() -> Result<Vec<String>, String> { … }

// register it
tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_audio_devices])
```

```ts
// renderer — a typed wrapper beside the code that uses it
import { invoke } from '@tauri-apps/api/core'

type AudioDevice = string

export async function getAudioDevices(): Promise<AudioDevice[]> {
  return invoke<AudioDevice[]>('get_audio_devices')
}
```

Never call `invoke('some_command')` inline in a component. The wrapper is the only place the
command's name and its argument/return types are stated, so it is the only place a rename
breaks — and `invoke` is untyped by default, which makes a bare call a silent `any`.

**Argument casing**: Rust `snake_case` parameters map to `camelCase` on the JS side by
default. A command receiving `undefined` for every argument is nearly always this.

A command returning `Result<T, E>` rejects the promise on `Err` — handle it; an unhandled
rejection in the renderer is invisible in the native window.

## Capabilities — this is security, not configuration

Tauri 2 gates every native capability through `src-tauri/capabilities/*.json`. A permission
grants the renderer — and anything that ever executes in it — real access to the user's
machine.

```jsonc
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:allow-open-url",
    { "identifier": "fs:allow-read-file", "allow": [{ "path": "$AUDIO/**" }] }
  ]
}
```

- Add the **narrowest** permission the feature needs. Never a wildcard scope, never
  `fs:default` when one scoped read will do.
- Use path variables (`$AUDIO`, `$APPDATA`) rather than absolute paths.
- Say in your report exactly what you widened and why. Treat this like a CSP change: it
  needs a stated reason.

"Command not allowed" / "not found in the ACL" at runtime means a missing capability, not a
missing command. Add the permission; do not switch to a broader plugin to get around it.

## CSP

`tauri.conf.json`'s `security.csp` governs what the renderer may load. **Never weaken it to
make an asset load.** Bundle the asset, or use the asset protocol with a scoped permission.
A `'unsafe-inline'` or `*` added to silence a console error is a real vulnerability in a
process that has filesystem access.

## State and events

Shared Rust state via `tauri::State<T>` with interior mutability (`Mutex`), registered with
`.manage(…)`. For push from Rust to the renderer, emit an event and listen:

```rust
app.emit("download://progress", payload)?;
```

```ts
const un = await listen<Progress>('download://progress', (e) => …)
// always unlisten on unmount — listeners survive the component otherwise
```

## Commands

```bash
pnpm --filter @bitrate/desktop dev            # vite renderer
pnpm --filter @bitrate/desktop tauri dev      # full app
pnpm --filter @bitrate/desktop exec tsc --noEmit
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

If the Rust toolchain is not installed, say so explicitly rather than reporting a pass.
Signed release builds and code signing are the user's to run.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@tauri-apps/api` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@tauri-apps/api/package.json').version"
   ```
2. **Then the official docs:** https://v2.tauri.app — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because most Tauri material online is v1, whose API and permission model differ entirely.

## Related

- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md` — the rules that apply.
- `br-desktop-developer` agent — owns this surface.
