import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmTabsImports } from '../index'
import { HlmTabs } from './hlm-tabs'

/** `variant` belongs to the list (`hlm-tabs-list`), not to `hlm-tabs`. */
type TabsArgs = { variant: 'default' | 'line' }

const meta = {
  title: 'UI/Tabs',
  component: HlmTabs,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmTabsImports] })],
  parameters: { layout: 'centered' },
  args: { variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'line'] } },
  render: (args) => ({
    props: args,
    template: `
      <hlm-tabs tab="episodes" class="w-96">
        <hlm-tabs-list [variant]="variant" aria-label="Podcast sections">
          <button hlmTabsTrigger="episodes" type="button">Episodes</button>
          <button hlmTabsTrigger="metadata" type="button">Metadata</button>
          <button hlmTabsTrigger="history" type="button" [disabled]="true">History</button>
        </hlm-tabs-list>
        <div hlmTabsContent="episodes" class="pt-3">12 episodes, newest first.</div>
        <div hlmTabsContent="metadata" class="pt-3">Publisher, language and creation date.</div>
        <div hlmTabsContent="history" class="pt-3">Moderation history.</div>
      </hlm-tabs>
    `,
  }),
} satisfies Meta<TabsArgs>

export default meta
type Story = StoryObj<TabsArgs>

export const Default: Story = {}

export const Line: Story = { args: { variant: 'line' } }

export const Vertical: Story = {
  render: () => ({
    template: `
      <hlm-tabs tab="general" orientation="vertical" class="flex w-96 gap-4">
        <hlm-tabs-list aria-label="Settings sections">
          <button hlmTabsTrigger="general" type="button">General</button>
          <button hlmTabsTrigger="security" type="button">Security</button>
        </hlm-tabs-list>
        <div hlmTabsContent="general">General settings.</div>
        <div hlmTabsContent="security">Security settings.</div>
      </hlm-tabs>
    `,
  }),
}
