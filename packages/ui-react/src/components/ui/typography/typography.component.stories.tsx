import type { StoryObj, StrictMeta } from '@storybook/react-vite'

import { Typography } from './typography'

/**
 * Polymorphic text component supporting h1–h6 heading levels, body paragraphs,
 * and custom element types via the `as` or `asChild` props.
 */
const meta = {
  title: 'ui/Typography',
  component: Typography,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies StrictMeta<typeof Typography>

export default meta

type Story = StoryObj<typeof meta>

/** Heading level 1 — largest heading. */
export const Heading1: Story = {
  args: { level: 1, size: 'heading1', children: 'Heading 1' },
}

/** Heading level 2. */
export const Heading2: Story = {
  args: { level: 2, size: 'heading2', children: 'Heading 2' },
}

/** Heading level 3. */
export const Heading3: Story = {
  args: { level: 3, size: 'heading3', children: 'Heading 3' },
}

/** Heading level 4. */
export const Heading4: Story = {
  args: { level: 4, size: 'heading4', children: 'Heading 4' },
}

/** Heading level 5. */
export const Heading5: Story = {
  args: { level: 5, size: 'heading5', children: 'Heading 5' },
}

/** Heading level 6 — smallest heading. */
export const Heading6: Story = {
  args: { level: 6, size: 'heading6', children: 'Heading 6' },
}

/** Body / paragraph text (default size). */
export const Body: Story = {
  args: {
    as: 'p',
    children:
      'The quick brown fox jumps over the lazy dog. Body text uses the default size variant.',
  },
}

/** All heading sizes at once for visual comparison. */
export const Scale: Story = {
  render: () => (
    <div className="space-y-4">
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Typography
          key={level}
          level={level}
          size={`heading${level}` as `heading${typeof level}`}
        >
          Heading {level}
        </Typography>
      ))}
      <Typography as="p">Body paragraph text</Typography>
    </div>
  ),
}

/** Rendered as a custom element via the `as` prop. */
export const AsSpan: Story = {
  args: { as: 'span', children: 'Rendered as a <span>' },
}

/** Using asChild to merge props onto a child element. */
export const AsChild: Story = {
  render: () => (
    <Typography asChild>
      <a href="#top">Link rendered as Typography</a>
    </Typography>
  ),
}
