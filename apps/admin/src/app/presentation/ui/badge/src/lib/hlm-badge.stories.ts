import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmBadge } from './hlm-badge'

const VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const

const meta = {
  title: 'UI/Badge',
  component: HlmBadge,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmBadge] })],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
  },
  args: { variant: 'default' },
  render: (args) => ({
    props: args,
    template: `<span hlmBadge [variant]="variant">Published</span>`,
  }),
} satisfies Meta<HlmBadge>

export default meta
type Story = StoryObj<HlmBadge>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        @for (variant of variants; track variant) {
          <span hlmBadge [variant]="variant">{{ variant }}</span>
        }
      </div>
    `,
  }),
}

export const LongContent: Story = {
  render: () => ({
    template: `<span hlmBadge variant="secondary">Awaiting moderation review by the catalog team</span>`,
  }),
}
