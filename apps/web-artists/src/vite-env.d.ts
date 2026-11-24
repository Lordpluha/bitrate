/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the Bitrate API.
   *
   * The deployment variable is still called `NEXT_PUBLIC_API_URL` — it is shared with
   * `apps/web-player`, so renaming it globally would break that app. This app maps it to
   * `VITE_API_URL` at its own boundary (Dockerfile build arg, compose service env, CI build
   * arg), because Vite only exposes `VITE_`-prefixed variables to client code.
   */
  readonly VITE_API_URL?: string
  /** `true` shows the support chat (#572); off until the Privacy Policy names its providers. */
  readonly VITE_SUPPORT_CHAT_ENABLED?: string
  /**
   * Public address of the Bitrate player, used for links to a released album. Deployments map
   * the player's `NEXT_PUBLIC_SITE_URL` to it, like `VITE_API_URL` above.
   */
  readonly VITE_PLAYER_URL?: string
  /**
   * DSN of the `artists` Sentry project. Build-time like every `VITE_*` value; unset, the browser
   * SDK starts disabled. The Dockerfile also exposes it to the server as `SENTRY_DSN`.
   */
  readonly VITE_SENTRY_DSN?: string
  /** Sentry environment for this build; defaults to Vite's mode. */
  readonly VITE_SENTRY_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
