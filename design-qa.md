# Artist page design QA

## Visual truth and comparison inputs

- Primary visual truth: the two signed-in Spotify screenshots supplied in the conversation (top and scrolled states), each 1920×1024.
- Repeatable source captures: `output/playwright/spotify-reference-top-1920x1024.png` and `output/playwright/spotify-reference-scrolled-1920x1024.png`. These are live Spotify captures in a signed-out state, so account-only sidebars differ from the supplied screenshots.
- Implementation captures: `output/playwright/artist-page-top-1920x1024.png` and `output/playwright/artist-page-scrolled-1920x1024.png`.
- Combined comparison inputs: `output/playwright/artist-page-top-comparison.png` and `output/playwright/artist-page-scrolled-comparison.png`.
- Responsive captures: `output/playwright/artist-page-responsive-1366x768.png` and `output/playwright/artist-page-responsive-1024x768.png`.
- Desktop comparison viewport: 1920×1024 CSS pixels at device scale factor 1.
- Focused surfaces: artist hero and catalogue viewport, compact sticky header, 384px right sidebar, and its 352×235 About image slot.

The implementation intentionally renders the local `flote` catalogue and its real project images. It does not duplicate the reference artist's data or fabricate missing covers, listener totals, or playlists.

## Comparison history

### Pass 1

- P1, layout: the pre-existing shell used a 22% left column, which pushed the artist viewport too far right and made it substantially narrower than the reference. Fixed by setting the default desktop split to 15% left and 20.625% right.
- P1, structure: the artist screen lacked the reference hierarchy and scrolled state. Added the full-bleed hero, action row, numbered Popular list, functional Discography filters, Featuring shelf, and sampled-color compact sticky header.
- P1, behavior: the right-sidebar artist content was static text. Replaced it with internal artist links on the image and name, plus a validated external NCS artist URL.
- P2, spacing: central content started 8px too far inward. Normalized section padding to 24px at desktop.
- P2, image treatment: the right About image was square. Changed it to the measured 3:2 slot used by the reference.

### Pass 2

- P2, right-sidebar rhythm: the current-track image and About card appeared roughly 16–20px too high, and the track title was undersized. Increased the heading/image spacing and matched the 24px bold track-title treatment.
- P2, responsive layout: verified 1366×768 and 1024×768. No horizontal overflow was present; the existing shell correctly removes the right column below its desktop breakpoint.

### Pass 3

- P2, vertical rhythm: Featuring began about 18px earlier than the supplied scrolled reference. Adjusted its section padding and heading gap; the final title and card row now align with the reference state.
- Rebuilt both combined comparison images and inspected the full viewport plus the hero, Discography, sticky header, and right About surfaces at native dimensions.

## Functional and accessibility checks

- Primary play action populates the player and right sidebar; pause/play state updates correctly.
- Discography's Popular releases, Albums, and Singles and EPs controls update `aria-pressed` and render their corresponding real releases.
- The artist image, artist name, and current-track artist are real internal links.
- The visible `/artist/1460/flote` text resolves to `https://ncs.io/artist/1460/flote`, opens in a new tab, and carries `rel="noopener noreferrer"`.
- Buttons and links have semantic elements, accessible names, keyboard focus styles, and non-empty image alt text where the image conveys content.
- A fresh browser run completed with zero console errors. Development-only Next.js LCP hints were observed for dynamically loaded catalogue images; they did not affect layout, interaction, or the production build.

## Mobile navigation, search, player, and liked-songs follow-up

### Visual truth and evidence

- Source visual truth: the four follow-up screenshots supplied in the conversation: mobile Home/player crop (603×243), player-controls crop (401×133), liked-songs/rate-limit desktop state (1444×824), and mobile search crop (549×207). The conversation attachments do not expose filesystem paths.
- Browser-rendered implementation: `output/playwright/mobile-final-603x400.png` at a 603×400 CSS viewport, 603×400 output pixels, and device scale factor 1.
- Additional implementation evidence: `output/playwright/mobile-player-after-603x400.png`, `output/playwright/mobile-player-after-1024x768.png`, `output/playwright/mobile-home-active-outline-603x400.png`, and `output/playwright/mobile-search-grey-603x400.png`.
- Full-view before/after comparison input inspected together: `output/playwright/mobile-player-comparison-1024x768.png`, built from equal 1024×768 captures at device scale factor 1.
- The source mobile images are focused crops rather than equal-height full viewports. Density was not resampled; comparisons at 603px width were limited to the persistent player and navigation regions, avoiding false precision elsewhere.
- State: authenticated mobile shell with the real local `flote`/`Deep End` content, track selected and liked, playback returned to paused, and mobile navigation/search active states.

### Comparison history

#### Mobile pass 1

- P1, controls: the original player exposed no Previous action and rendered Play and Next as nearly identical triangles. Added distinct Previous, Play/Pause, and Next controls with correct stroke treatment and accessible labels.
- P1, liked data: ordinary API routes were accidentally constrained by the 10/min auth throttler, while 429 error bodies were still retried because they expose `statusCode`. Registered only the 100/min global limiter, scoped 10/min overrides to auth controllers, stopped retrying 401/403/429, and deduplicated the 429 toast.
- P1, server state: a failed server liked-tracks request could become an empty/not-found state. The server fetch now validates the HTTP response and preserves errors instead of reporting zero liked songs.
- P2, layout: the player pill used a capped width and left offset. It now spans the viewport with safe-area-aware 8px side margins.
- P2, icons/state: active Home used a solid house and the mobile player lacked the expected saved indicator. Home is now an emphasized outline, and a liked track shows a green circled check.
- P2, search surface: the search input did not have a distinct filled surface. It now uses the existing grey `background-highlight` theme token.

#### Mobile pass 2

- Re-captured the player at 603×400 and 1024×768 after the fixes. At 603px the pill measures x=8, width=587, leaving 8px on both sides; it no longer clips or leaves a large unused edge.
- Saved, Previous, Play, and Next each measure 44×44 CSS pixels. Previous and Next were both activated successfully in the browser, and the liked button exposes `aria-pressed="true"`.
- The active Home SVG computes to `fill: none`, `stroke: currentColor`, `stroke-width: 3`. The search input computes to `rgb(23, 23, 23)`.
- A fresh `mobile-final` browser session finished with zero console errors and one Next.js development-only warning.

### Required fidelity surfaces

- Fonts and typography: existing Poppins/Kanit typography, track hierarchy, truncation, and bottom-nav labels remain unchanged and legible at both tested widths.
- Spacing and layout rhythm: the persistent pill is full-width with symmetric safe-area margins; all transport actions have consistent 44px tap targets and separate spacing.
- Colors and tokens: the saved state uses the semantic green treatment, Home retains the shell's active foreground, and search uses the shared grey background token rather than a hardcoded color.
- Image quality and asset fidelity: the real project cover remains sharp and correctly cropped; Lucide icons are used consistently, with no placeholder, emoji, CSS-art, or custom SVG substitution.
- Copy and content: track/artist copy remains real project data; semantic control names distinguish Saved, Previous, Play, and Next.
- Responsiveness: no horizontal overflow or control collision was visible at 603×400 or 1024×768.

### Runtime and regression evidence

- Fifteen consecutive local `GET /api/v1/tracks` requests returned 200, confirming ordinary track routes no longer inherit the 10/min auth limit.
- Twelve consecutive local `GET /api/v1/auth/me` requests returned ten 401 responses followed by two 429 responses, confirming the stricter limit remains scoped to auth.
- Web regression tests: 2 files, 14 tests passed. API rate-limit and controller regression tests: 4 suites, 29 tests passed.
- Web and API TypeScript checks, Biome on all 19 touched files, API production build, and web production build passed.

## Final status

- Open P0 findings: none.
- Open P1 findings: none.
- Open P2 findings: none.

final result: passed
