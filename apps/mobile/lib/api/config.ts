const trimSlash = (value: string) => value.replace(/\/$/, '')

/**
 * The Bitrate API origin (`EXPO_PUBLIC_API_URL`, inlined at build time). Localhost is only a
 * development default: an Android emulator reaches the host machine at `10.0.2.2` instead, and a
 * physical device needs the host's LAN address — set the variable in `.env` for either.
 */
export const API_BASE_URL = trimSlash(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000')

