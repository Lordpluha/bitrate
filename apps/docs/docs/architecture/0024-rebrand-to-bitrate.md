# ADR-0024: Rebrand the project from spotify-clone to Bitrate

Status: Accepted

Date: 2026-09-02

## Context

The repository was built as a Spotify clone and carried that everywhere: the `@spotify/*`
package namespace, the `spotify-clone` repository name, Postgres databases and a Docker network
named after it, Spotify's green `#1db954` as the product's primary colour, Spotify's logo mark,
and — most consequentially — marketing copy lifted verbatim from Spotify for Artists, including
`© 2026 Spotify AB`, a real recording artist presented as a Spotify for Artists user, and
Spotify's registered product names (Canvas, Marquee, Discovery Mode, Loud & Clear, Showcase).

`PRODUCT.md` had described that identity as "scaffolding" pending a rebrand, but the rebrand had
no target. `apps/docs/docs/brand/brand.md` and its sibling `design.md` now define one: **Bitrate — all-in-one for musicians**,
with a brand board fixing the palette and three themes. The resemblance was no longer a
placeholder waiting on a decision; it was an unbounded liability sitting in a public repository.

## Decision

Rebrand to Bitrate across every layer, in five ordered phases, each independently verifiable:

1. **Package namespace** — `@spotify/*` to `@bitrate/*` across 14 workspaces.
2. **Repository identity** — repository metadata, root docs, `.claude/`, the Docusaurus site,
   GitHub URLs, and the Expo app's bundle identifier.
3. **Infrastructure** — Postgres databases, Docker network and containers, container-image OS
   users, the mail sender, the admin panel's Knex data source, Prometheus metric names, and the
   Redis rate-limit key prefix.
4. **Visual identity** — the palette and semantic roles in `packages/ui-react/src/styles/`, a
   third theme, client storage keys.
5. **Copy** — every user-facing string that named Spotify.

`brand.md` is the source of truth for positioning, promise, and tone; `design.md` for design
rules — both under `apps/docs/docs/brand/`; `apps/docs/docs/brand/bitrate-brand-board.png` for the palette and theme values.
`packages/ui-react/src/styles/` remains the only source for token values themselves — see
[ADR-0023](0023-tokens-into-ui-react.md).

Three decisions inside those phases are worth recording, because each is a place where the
obvious mechanical answer was wrong:

**Historical documents keep the old names.** `@spotify/tokens` and `@spotify/tokens-generator`
were removed by ADR-0023 before this rebrand. The ADRs, blog post, and changeset that narrate
their removal still say `@spotify/*`, because no package ever existed under `@bitrate/tokens` and
renaming it there would fabricate history.

**Spotify's product names became descriptions, not new Bitrate product names.** Replacing only
the word "Spotify" in `apps/web-artists` would have left Canvas, Marquee, and Loud & Clear
standing under Bitrate's banner — a worse outcome than before, since it would read as Bitrate
claiming another company's products. Inventing Bitrate equivalents would have been a product
decision this rebrand had no authority to make. Each became a plain description of what the
capability does.

**Copy that would have become a false claim was rewritten, not translated.** The landing page
carried Spotify's real "517.69 million+ users worldwide"; under Bitrate that is a fabricated
metric, which `brand.md` §12 forbids. It now asserts no number. A testimonial naming a real
artist was rewritten without her rather than re-attributed.

**Dim is a partial theme.** The brand board specifies eight tokens for dim. `:root.dim`
overrides only those; every other role, component-scoped roles included, inherits its dark
value. Requiring a dim block in all 22 part-files would mean inventing values the brand has not
decided.

## Consequences

Breaking, and accepted deliberately:

- **Prometheus metrics** renamed `spotify_api_http_*` to `bitrate_api_http_*`. Dashboards and
  alerts on the old names return no data.
- **Redis rate-limit prefix** changed, so in-flight counters reset once at deploy.
- **Postgres databases** renamed. Existing environments need the volume recreated and migrations
  and seed re-run; `.env`, `apps/api/.env.development`, and `apps/api/.env.test` must be updated
  by hand.
- **Client storage keys and the service-worker cache** renamed. Saved playlists, recent searches,
  player position, restored session, and settings do not carry over.
- **TOTP issuer** changed from `Spotify` to `Bitrate`. Enrolled authenticator entries keep
  working but appear under a second entry; users should re-scan.
- **Mobile and desktop bundle identifiers** changed, so existing installs and deep links do not
  carry over. They stay owner-namespaced (`com.lordpluha.*`) rather than claiming a `bitrate.*`
  domain, because `brand.md` §17 makes the name conditional on trademark and domain clearance.
- **Screenshot baselines** are all stale; the entire palette changed.

Explicitly out of scope, and still open:

- **The logo.** `design.md` §24 leaves the mark undecided and one is being designed, so
  `SpotifyLogo`, its SVG asset, `aria-label="Spotify Home"`, and `public/icon.svg` are unchanged
  on purpose. They change together once a Bitrate mark exists.
- **The Vercel preview host** `spotify-clone-web-olive.vercel.app`, kept until the deployment is
  renamed.
- **Renaming the GitHub repository and the local checkout**, which is a manual step; URLs in the
  repo already point at `github.com/Lordpluha/bitrate-music`.

## Alternatives considered

- **Rebrand in one commit** — rejected. A single change spanning namespace, infrastructure,
  palette, and copy is unreviewable, and a failure anywhere makes the whole thing unbisectable.
  Five phases each pass `build`, `check-types`, `lint`, and the test suites on their own.
- **Keep the `@spotify/*` namespace** — rejected. Nothing publishes to npm, so the namespace is
  cosmetic, but it is the string that appears in every import in the repository and is the single
  most visible carrier of the old identity.
- **Leave infrastructure identifiers alone** — rejected. They cost a volume recreation once,
  and leaving them means the name survives in the place hardest to change later, once production
  data exists.
- **Rename Spotify's product names to Bitrate equivalents** — rejected as out of authority; see
  the Decision section.
