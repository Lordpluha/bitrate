import { defineConfig } from 'eslint/config'
import { nextJsConfig } from '@spotify/eslint/next-js'
import { FSDConfig } from '@spotify/eslint/architecture'

/** @type {import("eslint").Linter.Config} */
export default defineConfig({
  extends: [nextJsConfig, FSDConfig]
})
