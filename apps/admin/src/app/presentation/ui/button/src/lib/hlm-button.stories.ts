import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide'
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmButton } from './hlm-button'

const VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const
const SIZES = ['xs', 'sm', 'default', 'lg'] as const

const meta = {
  title: 'UI/Button',
  component: HlmButton,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [HlmButton, NgIcon],
      providers: [provideIcons({ lucidePlus, lucideTrash2 })],
    }),
  ],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: {
      control: 'select',
      options: [...SIZES, 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
  },
  args: { variant: 'default', size: 'default' },
  render: (args) => ({
    props: args,
    template: `<button hlmBtn type="button" [variant]="variant" [size]="size">Save changes</button>`,
  }),
} satisfies Meta<HlmButton>

export default meta
type Story = StoryObj<HlmButton>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        @for (variant of variants; track variant) {
          <button hlmBtn type="button" [variant]="variant">{{ variant }}</button>
        }
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    props: { sizes: SIZES },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        @for (size of sizes; track size) {
          <button hlmBtn type="button" variant="outline" [size]="size">{{ size }}</button>
        }
      </div>
    `,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button hlmBtn type="button">
          <ng-icon name="lucidePlus" data-icon="inline-start" />
          New genre
        </button>
        <button hlmBtn type="button" variant="destructive" size="icon" aria-label="Delete">
          <ng-icon name="lucideTrash2" />
        </button>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button hlmBtn type="button" disabled>Default</button>
        <button hlmBtn type="button" variant="outline" disabled>Outline</button>
        <button hlmBtn type="button" variant="destructive" disabled>Deleting…</button>
      </div>
    `,
  }),
}
