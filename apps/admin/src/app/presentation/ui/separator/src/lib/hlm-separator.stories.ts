import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmSeparator } from './hlm-separator'

const meta = {
  title: 'UI/Separator',
  component: HlmSeparator,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmSeparator] })],
  parameters: { layout: 'centered' },
  render: () => ({
    template: `
      <div class="w-72 text-sm">
        <p class="font-medium">Catalog</p>
        <p class="text-muted-foreground">Tracks, albums and podcasts.</p>
        <hlm-separator class="my-4" />
        <p class="text-muted-foreground">Moderation queue</p>
      </div>
    `,
  }),
} satisfies Meta<HlmSeparator>

export default meta
type Story = StoryObj<HlmSeparator>

export const Horizontal: Story = {}

export const Vertical: Story = {
  render: () => ({
    template: `
      <div class="flex h-5 items-center gap-4 text-sm">
        <span>Tracks</span>
        <hlm-separator orientation="vertical" />
        <span>Albums</span>
        <hlm-separator orientation="vertical" />
        <span>Podcasts</span>
      </div>
    `,
  }),
}
