import type { StoryObj, StrictMeta } from '@storybook/react-vite'

import { Label } from '../label'
import { Checkbox } from './checkbox'

/**
 * A single on/off choice with Base UI keyboard and focus behaviour.
 * Pair it with a `Label` so the whole sentence is clickable.
 */
const meta = {
  title: 'ui/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Accept the terms',
  },
} satisfies StrictMeta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof Checkbox>

/** Default, unchecked. */
export const Default: Story = {}

/** Checked by default. */
export const Checked: Story = {
  args: { defaultChecked: true },
}

/** Disabled in both states. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** Wrapped in a label so clicking the text toggles the box. */
export const WithLabel: Story = {
  render: () => (
    <Label className="flex items-center gap-2">
      <Checkbox />I accept the terms
    </Label>
  ),
}
