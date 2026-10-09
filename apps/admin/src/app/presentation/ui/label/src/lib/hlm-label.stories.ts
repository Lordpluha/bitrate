import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmInput } from '@spartan-ng/helm/input'
import { HlmLabel } from './hlm-label'

const meta = {
  title: 'UI/Label',
  component: HlmLabel,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmLabel, HlmInput] })],
  parameters: { layout: 'centered' },
  render: () => ({
    template: `<label hlmLabel>Release title</label>`,
  }),
} satisfies Meta<HlmLabel>

export default meta
type Story = StoryObj<HlmLabel>

export const Default: Story = {}

export const WithControl: Story = {
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <label hlmLabel for="label-control">Release title</label>
        <input hlmInput id="label-control" type="text" />
      </div>
    `,
  }),
}

/** `peer-disabled:` dims the label when it follows a disabled control. */
export const DisabledPeer: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-2">
        <input id="label-disabled" type="checkbox" class="peer" disabled />
        <label hlmLabel for="label-disabled">Explicit content</label>
      </div>
    `,
  }),
}
