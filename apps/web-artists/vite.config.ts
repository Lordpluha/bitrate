import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3002,
    /**
     * `next dev` bound 0.0.0.0 by default; Vite binds localhost, which makes the dev container
     * in docker-compose.preprod.yaml unreachable from the host. Keep this.
     */
    host: true,
  },
  resolve: {
    /** Vite 8 reads the `paths` map from tsconfig.json directly — no vite-tsconfig-paths needed. */
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    /**
     * Without Nitro, `vite build` emits dist/client + dist/server, and dist/server/server.js is
     * a fetch handler that exits immediately under `node` — there is nothing to deploy. Nitro
     * wraps it into the self-contained .output/server/index.mjs the Dockerfile runs.
     */
    nitroV2Plugin(),
    /** react's vite plugin must come after start's vite plugin. */
    viteReact(),
  ],
})
