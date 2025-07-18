import globals from 'globals'
import tseslint from 'typescript-eslint'
import config from '@spotify/eslint/nest.js'

export default tseslint.config(
  config,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ignores: ['eslint.config.mjs']
      }
    }
  }
)
