import { mergeConfig } from 'vite'
import config from '../../vite.config.ts'

// Keep test dependency optimization isolated from the developer's running Vite server.
export default mergeConfig(config, {
  envDir: false,
  cacheDir: 'node_modules/.vite-dashboard-tests',
})
