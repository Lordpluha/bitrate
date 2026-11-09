import { NextResponse } from 'next/server'

/** Where the server reaches the artist portal; inside Docker that is the `web-artists` service. */
const DEFAULT_ARTISTS_URL = 'http://localhost:3002'
/** The landing polls once a minute, so a slow portal must not hold the answer for long. */
const ARTISTS_TIMEOUT_MS = 3000

export const dynamic = 'force-dynamic'

/** Whether the artist portal's server answers its home page. */
const probeArtists = async () => {
  const url = process.env.WEB_ARTISTS_URL ?? DEFAULT_ARTISTS_URL
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(ARTISTS_TIMEOUT_MS),
    })
    /* a redirect (to login, to the locale) is the portal answering too */
    return res.status < 500 ? 'ok' : 'down'
  } catch {
    return 'down'
  }
}

/**
 * Frontend health for the landing's status panel. Answering at all proves the web player is up;
 * the artist portal lives on another origin without CORS, so the server checks it on the page's
 * behalf. nginx answers `/health` itself, which is why this is not that path.
 */
export const GET = async () =>
  NextResponse.json(
    { webArtists: await probeArtists() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
