// @ts-check
const eslint = require('@eslint/js')
const angular = require('angular-eslint')
const prettier = require('eslint-config-prettier')
const tseslint = require('typescript-eslint')

/**
 * This app is the one place in the monorepo that does not use Biome as its lint gate.
 * Biome cannot parse Angular template semantics — bindings, control flow, the `(event)` syntax
 * an a11y rule has to understand — and ESLint is the only linter that accepts a third-party
 * parser. See ADR-0035 and `.claude/rules/code-style.md`.
 *
 * `eslint-config-prettier` goes last in every block so formatting stays Prettier's job.
 */
module.exports = tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      /** Repo rule: no production `any`, no suppression shortcuts. */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      /**
       * `typescript-eslint`'s stylistic preset prefers `interface`; `.claude/rules/typescript.md`
       * writes every named shape as a `type`. Repo convention wins.
       */
      '@typescript-eslint/consistent-type-definitions': 'off',
      /** `const { x: _removed, ...rest }` is the idiom for omitting a key. */
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    /**
     * `src/app/shared/ui/**` is vendored spartan-ng source, copied in by `@spartan-ng/cli`, not
     * written here. It carries the library's own `hlm` prefix and its own export surface, so the
     * app's `app` prefix does not apply — treat it the way generated code is treated elsewhere in
     * the monorepo: reviewed on the way in, not linted to the app's conventions afterwards.
     */
    files: ['src/app/shared/ui/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettier,
    ],
    rules: {
      /**
       * Off, and not by oversight. The rule predates signals and cannot tell a signal read —
       * `count()`, the idiomatic and cheap way to read state in this codebase — from an
       * expensive method call; it flagged every one of them. Its only escape hatches are an
       * explicit `allowList`, `allowPrefix` and `allowSuffix`, none of which describe "is a
       * signal". Left on, it produces warnings nobody can act on, which is worse than silence.
       *
       * The concern it encodes is real, so it belongs in review instead: a template expression
       * that does work, rather than reading state, runs on every change detection pass.
       */
      '@angular-eslint/template/no-call-expression': 'off',
    },
  },
)
