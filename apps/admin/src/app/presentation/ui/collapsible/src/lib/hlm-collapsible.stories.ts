import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmButton } from '@spartan-ng/helm/button'
import { HlmCollapsibleImports } from '../index'
import { HlmCollapsible } from './hlm-collapsible'

/** `expanded` is a BrnCollapsible host-directive input, so it is not on HlmCollapsible itself. */
type CollapsibleArgs = { expanded: boolean }

const meta = {
  title: 'UI/Collapsible',
  component: HlmCollapsible,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmCollapsibleImports, HlmButton] })],
  parameters: { layout: 'centered' },
  args: { expanded: false },
  argTypes: { expanded: { control: 'boolean' } },
  render: (args) => ({
    props: args,
    template: `
      <hlm-collapsible [expanded]="expanded" class="flex w-80 flex-col gap-2">
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium">Processing attempts (3)</span>
          <button hlmCollapsibleTrigger hlmBtn type="button" variant="ghost" size="sm">Toggle</button>
        </div>
        <div class="rounded-md border border-border px-4 py-2 text-sm">Attempt #3 — succeeded</div>
        <hlm-collapsible-content class="flex flex-col gap-2">
          <div class="rounded-md border border-border px-4 py-2 text-sm">Attempt #2 — failed: timeout</div>
          <div class="rounded-md border border-border px-4 py-2 text-sm">Attempt #1 — failed: bad codec</div>
        </hlm-collapsible-content>
      </hlm-collapsible>
    `,
  }),
} satisfies Meta<CollapsibleArgs>

export default meta
type Story = StoryObj<CollapsibleArgs>

export const Collapsed: Story = {}

export const Expanded: Story = { args: { expanded: true } }
