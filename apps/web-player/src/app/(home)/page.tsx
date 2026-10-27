import { SESSION_COOKIE_NAMES } from '@bitrate/contracts'
import { LandingView } from '@views/LandingView'
import { cookies } from 'next/headers'

/** Session cookies set by the API; either one means the visitor can reach the player without logging in. */
const SESSION_COOKIES = [
  SESSION_COOKIE_NAMES.user.access,
  SESSION_COOKIE_NAMES.user.refresh,
]

export default async function Page() {
  const jar = await cookies()
  const signedIn = SESSION_COOKIES.some((name) => jar.has(name))
  return <LandingView signedIn={signedIn} />
}
