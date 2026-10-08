import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmButton } from '@spartan-ng/helm/button'
import { HlmTooltip } from './hlm-tooltip'

const POSITIONS = ['top', 'right', 'bottom', 'left'] as const

const meta = {
  title: 'UI/Tooltip',
  component: HlmTooltip,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmTooltip, HlmButton] })],
  parameters: { layout: 'centered' },
  render: () => ({
    template: `
      <button hlmBtn type="button" variant="outline" hlmTooltip="Copies the ID to the clipboard">
        Copy ID
      </button>
    `,
  }),
} satisfies Meta<HlmTooltip>

export default meta
type Story = StoryObj<HlmTooltip>

export const Default: Story = {}

export const Positions: Story = {
  render: () => ({
    props: { positions: POSITIONS },
    template: `
      <div class="flex flex-wrap items-center gap-3 p-12">
        @for (position of positions; track position) {
          <button hlmBtn type="button" variant="outline" [hlmTooltip]="'Tooltip on ' + position" [position]="position">
            {{ position }}
          </button>
        }
      </div>
    `,
  }),
}

export const TooltipDisabled: Story = {
  render: () => ({
    template: `
      <button hlmBtn type="button" variant="outline" hlmTooltip="Never shown" [tooltipDisabled]="true">
        No tooltip
      </button>
    `,
  }),
}
