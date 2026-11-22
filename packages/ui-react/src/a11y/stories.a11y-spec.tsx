import { composeStories, type composeStory } from '@storybook/react-vite'
import { render } from '@testing-library/react'
import axe, { type Result } from 'axe-core'
import { describe, expect, it } from 'vitest'
import preview from '../../.storybook/preview'

/**
 * The accessibility gate for the design system (ACCESSIBILITY.md, D-3): every story renders in
 * a real browser with the real CSS in each theme, and axe must report no WCAG 2.2 A/AA
 * violation, contrast included.
 */
type StoryModule = Parameters<typeof composeStories>[0]

/**
 * A module typed only as "some CSF file" (from `import.meta.glob`) leaves `composeStories`
 * nothing to infer each export from, so the composed stories are typed by their shared shape.
 */
type ComposedStory = ReturnType<typeof composeStory>

const storyModules = import.meta.glob<StoryModule>('../**/*.stories.tsx', { eager: true })

const THEMES = ['dark', 'light', 'dim'] as const

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

type AxeRuleToggle = { id: string; enabled: boolean }

/** The story's `parameters.a11y`, as the Storybook a11y addon reads it. */
type StoryA11yParameters = {
  test?: 'off' | 'todo' | 'error'
  config?: { rules?: AxeRuleToggle[] }
}

const readA11yParameters = (parameters: Record<string, unknown>): StoryA11yParameters => {
  const value = parameters.a11y
  return typeof value === 'object' && value !== null ? (value as StoryA11yParameters) : {}
}

/** One line per failing node, so a failure names the rule, the element and the fix. */
const describeViolation = (violation: Result) =>
  violation.nodes.map(
    (node) => `${violation.id}: ${node.target.join(' ')} — ${node.failureSummary ?? ''}`,
  )

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

for (const [path, storyModule] of Object.entries(storyModules)) {
  for (const theme of THEMES) {
    const stories: Record<string, ComposedStory> = composeStories(storyModule, {
      ...preview,
      initialGlobals: { theme },
    })

    describe(`${path.replace('../', '')} [${theme}]`, () => {
      for (const [name, Story] of Object.entries(stories)) {
        const a11y = readA11yParameters(Story.parameters)
        const run = a11y.test === 'off' ? it.skip : it

        run(name, async () => {
          render(<Story />)
          /** The preview decorator applies the theme class in an effect; let it paint. */
          await nextFrame()
          await nextFrame()

          const { violations } = await axe.run(document.body, {
            runOnly: { type: 'tag', values: WCAG_TAGS },
            rules: Object.fromEntries(
              (a11y.config?.rules ?? []).map((rule) => [rule.id, { enabled: rule.enabled }]),
            ),
          })

          expect(violations.flatMap(describeViolation)).toEqual([])
        })
      }
    })
  }
}
