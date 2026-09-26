import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * This package is the one place in the monorepo besides `apps/admin` and `apps/mobile` that
 * does not use Biome as its lint gate. Biome cannot lint Svelte templates — ESLint is the only
 * linter with a Svelte parser — so `packages/player` is excluded from `biome.json` the same
 * way. See `.claude/rules/code-style.md` and `.claude/rules/player-rules.md`.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  js.configs.recommended,
  {
    files: ['scripts/**/*.mjs', 'svelte.config.js', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    rules: {
      /** Repo rule: no production `any`, no suppression shortcuts. */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      /** `.claude/rules/typescript.md` writes every named shape as a `type`. */
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    /**
     * `.svelte.ts`/`.svelte.js` modules (runes usable outside a `.svelte` file, e.g.
     * `player-state.svelte.ts`) hit the same `eslint-plugin-svelte` base config block as
     * `.svelte` files and need the same TypeScript-parser override — without it, TS-only
     * syntax like an inline `type` import specifier fails to parse. See the `svelte` skill.
     */
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  /**
   * The contract-Svelte-free gate, made mechanical. `src/contract/index.unit-spec.ts` (a real
   * consumer of the contract's own types) still needs `vitest` and relative imports, so this
   * only forbids what would drag Svelte, the element, the embed build, or the package's own
   * default/`/element` entry into a module that must stay importable from a server bundle with
   * no DOM. `@bitrate/player/engine` is forbidden too, deliberately: the engine subpath is a
   * temporary migration export (ADR-0039), not part of the stable contract, and the contract
   * should not couple itself to an implementation detail that is meant to go away. `import
   * type`/`export type` are exempt everywhere below — they erase at compile time and carry no
   * runtime dependency.
   *
   * `no-restricted-imports` (via `@typescript-eslint/no-restricted-imports`) only checks
   * static `import`/`export ... from` — never a dynamic `import()`. The `no-restricted-syntax`
   * block below closes that gap for `await import('svelte')` and friends.
   */
  {
    files: ['src/contract/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['svelte', 'svelte/*'],
              message:
                'src/contract/** must stay importable with no DOM and no custom-element registry — no Svelte imports. `import type` is fine.',
              allowTypeImports: true,
            },
            {
              group: ['**/*.svelte'],
              message:
                'src/contract/** must stay importable with no DOM and no custom-element registry — no .svelte file imports. `import type` is fine.',
              allowTypeImports: true,
            },
            {
              group: ['**/element', '**/element/**'],
              message:
                'src/contract/** must stay importable with no DOM and no custom-element registry — no element/ imports. `import type` is fine.',
              allowTypeImports: true,
            },
            {
              group: ['**/embed', '**/embed/**'],
              message:
                'src/contract/** must stay importable with no DOM and no custom-element registry — no embed/ imports. `import type` is fine.',
              allowTypeImports: true,
            },
            {
              group: ['@bitrate/player', '@bitrate/player/element', '@bitrate/player/engine'],
              message:
                "src/contract/** must not import the package's own default/element entry (drags in Svelte) or the temporary /engine migration export. `import type` is fine.",
              allowTypeImports: true,
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ImportExpression[source.value=/^(svelte(\\/.*)?|.*\\.svelte|(.*\\/)?(element|embed)(\\/.*)?|@bitrate\\/player(\\/(element|engine))?)$/]',
          message:
            'src/contract/** must stay importable with no DOM and no custom-element registry — no dynamic import() of Svelte, .svelte files, element/, embed/, or the package default/element/engine entries.',
        },
      ],
    },
  },
  prettier,
)
