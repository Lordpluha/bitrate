import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmLabel } from '@spartan-ng/helm/label'
import { HlmInput } from './hlm-input'

const meta = {
  title: 'UI/Input',
  component: HlmInput,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmInput, HlmLabel] })],
  parameters: { layout: 'centered' },
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <label hlmLabel for="input-default">Display name</label>
        <input hlmInput id="input-default" type="text" placeholder="e.g. Night Drive" />
      </div>
    `,
  }),
} satisfies Meta<HlmInput>

export default meta
type Story = StoryObj<HlmInput>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <label hlmLabel for="input-value">Email</label>
        <input hlmInput id="input-value" type="email" value="operator@bitrate.me" />
      </div>
    `,
  }),
}

export const Invalid: Story = {
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <label hlmLabel for="input-invalid">Slug</label>
        <input hlmInput id="input-invalid" type="text" value="Not a slug!" [forceInvalid]="true" aria-invalid="true" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex w-72 flex-col gap-2">
        <label hlmLabel for="input-disabled">Track ID</label>
        <input hlmInput id="input-disabled" type="text" value="trk_01HZX4" disabled />
      </div>
    `,
  }),
}
