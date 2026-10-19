import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmLabel } from '@spartan-ng/helm/label'
import { HlmSelectImports } from '../index'
import { HlmSelect } from './hlm-select'

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' },
  { value: 'all', label: 'All' },
]

const meta = {
  title: 'UI/Select',
  component: HlmSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmSelectImports, HlmLabel] })],
  parameters: { layout: 'centered' },
  render: () => ({
    props: { statuses: STATUSES },
    template: `
      <hlm-select>
        <hlm-select-trigger class="w-56">
          <hlm-select-value placeholder="Filter by status" />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal>
          <hlm-select-group>
            @for (status of statuses; track status.value) {
              <hlm-select-item [value]="status.value">{{ status.label }}</hlm-select-item>
            }
          </hlm-select-group>
        </hlm-select-content>
      </hlm-select>
    `,
  }),
} satisfies Meta<HlmSelect>

export default meta
type Story = StoryObj<HlmSelect>

export const Default: Story = {}

export const WithValue: Story = {
  render: () => ({
    props: { statuses: STATUSES, value: 'active' },
    template: `
      <hlm-select [value]="value">
        <hlm-select-trigger class="w-56">
          <hlm-select-value />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal>
          <hlm-select-group>
            @for (status of statuses; track status.value) {
              <hlm-select-item [value]="status.value">{{ status.label }}</hlm-select-item>
            }
          </hlm-select-group>
        </hlm-select-content>
      </hlm-select>
    `,
  }),
}

export const GroupsAndSeparator: Story = {
  render: () => ({
    template: `
      <hlm-select>
        <hlm-select-trigger class="w-56">
          <hlm-select-value placeholder="Content type" />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal>
          <hlm-select-group>
            <hlm-select-label>Music</hlm-select-label>
            <hlm-select-item value="track">Track</hlm-select-item>
            <hlm-select-item value="album">Album</hlm-select-item>
          </hlm-select-group>
          <hlm-select-separator />
          <hlm-select-group>
            <hlm-select-label>Spoken</hlm-select-label>
            <hlm-select-item value="podcast">Podcast</hlm-select-item>
            <hlm-select-item value="episode" [disabled]="true">Episode</hlm-select-item>
          </hlm-select-group>
        </hlm-select-content>
      </hlm-select>
    `,
  }),
}

export const SmallTrigger: Story = {
  render: () => ({
    props: { statuses: STATUSES },
    template: `
      <hlm-select>
        <hlm-select-trigger class="w-40" size="sm">
          <hlm-select-value placeholder="Status" />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal>
          @for (status of statuses; track status.value) {
            <hlm-select-item [value]="status.value">{{ status.label }}</hlm-select-item>
          }
        </hlm-select-content>
      </hlm-select>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    template: `
      <hlm-select [disabled]="true">
        <hlm-select-trigger class="w-56">
          <hlm-select-value placeholder="Filter by status" />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal>
          <hlm-select-item value="active">Active</hlm-select-item>
        </hlm-select-content>
      </hlm-select>
    `,
  }),
}
