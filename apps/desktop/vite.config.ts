import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { desktopAliases, webPlayerPublicDir } from './vite/aliases'
import { createDevApiProxy } from './vite/apiProxy'
import { defineProcessEnv } from './vite/processEnv'

/** Set by `tauri dev` when serving to a device on the LAN. */
const host = process.env.TAURI_DEV_HOST

export default defineConfig(({ mode }) => {
  /** `.env`, `.env.local` and the shell, in Vite's precedence; the config sees no `.env` otherwise. */
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')

  return {
    plugins: [tailwindcss(), react()],
    define: defineProcessEnv({ mode }),
    publicDir: webPlayerPublicDir,
    resolve: {
      alias: desktopAliases,
    },
    build: {
      /** Tauri's webviews: WebView2 (Chromium), WKWebView and WebKitGTK are all ES2022-capable. */
      target: 'es2022',
      sourcemap: mode !== 'production',
    },
    /** Keep Rust compiler output visible in the `tauri dev` terminal. */
    clearScreen: false,
    server: {
      /** `tauri.conf.json` `devUrl` points here; a moved port would load nothing. */
      port: 1420,
      strictPort: true,
      host: host || 'localhost',
      hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
      proxy: createDevApiProxy({ apiUrl: env.VITE_API_URL }),
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  }
})
