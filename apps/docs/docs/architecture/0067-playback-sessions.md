# ADR-0067: Playback sessions — a token per play, a ~10-second cap and real-time pacing

Status: Accepted

Date: 2026-10-30

Stage 2 of [ADR-0065](./0065-single-cmaf-aac-delivery-format.md), tracked in
[#450](https://github.com/Lordpluha/bitrate/issues/450).

## Context

After ADR-0065 listener audio leaves the API only through `GET /tracks/:id/cmaf/:bitrate`. That
route was guarded only by the user's cookie and answered any `Range` — or none — with as many bytes
as asked, so a signed-in user could download a whole track in one request. Listening limits and
Bitrate Connect (stage 3) need a per-play handle they can count, revoke and move between devices.

## Decision

**A playback session per play.** `POST /tracks/:id/play-sessions` (listener auth, 120 per minute)
returns the manifest and a token; `GET /tracks/:id/manifest` is removed. Prefetching the next track
opens its own session; a session is not a counted listen.

**Hybrid token.** An HMAC-SHA256-signed token (the pattern of `signed-storage-token.ts`, with a
`bitrate-playback.v1.` domain prefix so storage tokens never verify) carries the session id, user,
track and expiry. A Redis hash `playback:session:<id>` marks the session alive;
`playback:user:<id>` lists a user's sessions; `playback:budget:<user>:<track>` counts the audio all
of that listener's sessions for the track have received, so opening more sessions buys no extra
audio. The signature rejects forgery; deleting the session key revokes. Both live for the track's duration plus 15 minutes; on a 403 web-player
opens one new session and retries. The optional Bitrate Connect `deviceId` is stored for stage 3.

**Transport.** The token travels as `?t=` on every rendition request — MSE and native `<audio>`
alike — and `/cmaf` authorises by it alone, without the cookie a native element cannot refresh. It
is redacted in the API's request logs (pino serializer) and nginx's access log (`map` on
`$request`).

**Revocation.** Logout, password reset, revoking a sign-in (one session or all others), a staff
session revocation and a take-down delete all of the user's playback sessions; a device that still
has its sign-in opens a new one on the 403. Charging a revoked session fails closed, so a paced
response in flight stops and the session cannot reappear.

**What a response may carry (D15).** A `Range` of at most the rendition's largest fragment
(~10 s) is served exactly — every request the MSE loader makes — and charged before any byte is
read. A missing or longer range is answered with one response to the end of the file whose bytes
are released no faster than the session's budget. The first draft cut every response at one
segment; measured in Playwright, WebKit's native player (GStreamer) failed on a short answer to a
closed range (`NotSupportedError`) and, under a byte cap, made one request without `Range` and
stalled waiting for the rest. A paced long response keeps it working while the track still cannot
be fetched whole at once.

**Pacing (D16).** A listener's sessions for one track may together receive at most the seconds
since the first of them opened plus 60 seconds of audio. Beyond that an exact request gets 429 with `Retry-After`, and a paced response waits inside
the stream.

**Redis outage (D18).** A validly signed, unexpired token still plays; revocation and pacing pause
until Redis returns, logged and counted in `bitrate_api_playback_session_degraded_total`.

**Untouched.** The player package contract (web-player owns the token inside `resolveManifest`,
`fetchRange` and `renditionUrl`); the staff-only `/admin/tracks/:id/audio` preview.

## Consequences

- Downloading a track takes at least its own length minus a minute. Recording it in real time stays
  possible; only DRM would stop that, and DRM is out of scope.
- Every rendition request costs a Redis round-trip; playback depends on Redis for revocation and
  pacing, not for playing.
- Heavy forward scrubbing can briefly wait on the budget.
- The player's browser tests run a `native` project in Chromium and WebKit against a model of the
  rule, so a change that breaks native playback fails there.

## Alternatives considered

- **Stateless token only** — cheap, but nothing to revoke or count.
- **Redis session id only** — revocable, but a Redis outage stops all playback.
- **Token in a header** — `<audio src>` cannot send one; two mechanisms instead of one.
- **A hard one-segment or byte cap on every response** — measured to break WebKit's native player.
- **Cookie and token together** — stricter, but native playback would stop when the access cookie
  expires mid-track.
- **Keep `GET /manifest` beside sessions** — a second way in, cacheable but session-less.
