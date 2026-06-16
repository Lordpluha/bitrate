import type { StoryObj, StrictMeta } from '@storybook/react-vite'

import { Label } from './label'

/**
 * Renders an accessible label associated with controls.
 * Styled with `peer-disabled` support so it dims when its paired input is disabled.
 */
const meta = {
  title: 'ui/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    htmlFor: { control: 'text' },
  },
  args: {
    children: 'Your email address',
    htmlFor: 'email',
  },
} satisfies StrictMeta<typeof Label>

export default meta

type Story = StoryObj<typeof Label>

/** Default label — pairs with an input via htmlFor. */
export const Default: Story = {}

/** Label paired with a disabled input — shows peer-disabled opacity. */
export const WithDisabledInput: Story = {
  render: (args) => (
    <div className="grid gap-1.5">
      <Label {...args} htmlFor="disabled-input">
        Disabled field
      </Label>
      <input
        id="disabled-input"
        disabled
        className="peer border rounded-md px-3 py-2 text-sm w-64"
        placeholder="Cannot edit"
      />
    </div>
  ),
}

/** Label with required marker. */
export const Required: Story = {
  render: (args) => (
    <Label {...args} htmlFor="required-input">
      Email address <span className="text-red-500">*</span>
    </Label>
  ),
}
