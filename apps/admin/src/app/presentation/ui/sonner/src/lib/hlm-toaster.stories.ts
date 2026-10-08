import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { toast } from '@spartan-ng/brain/sonner'
import { HlmButton } from '@spartan-ng/helm/button'
import { HlmToaster } from './hlm-toaster'

const meta = {
  title: 'UI/Sonner',
  component: HlmToaster,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmToaster, HlmButton] })],
  parameters: { layout: 'centered' },
  args: { position: 'bottom-right', richColors: false, closeButton: false },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    richColors: { control: 'boolean' },
    closeButton: { control: 'boolean' },
  },
  render: (args) => ({
    props: {
      ...args,
      show: () => toast('Genre saved', { description: 'Synthwave was renamed.' }),
      success: () => toast.success('Track restored'),
      info: () => toast.info('Export started'),
      warning: () => toast.warning('Export truncated to 10,000 rows'),
      error: () => toast.error('Could not delete genre'),
      loading: () => toast.loading('Uploading cover…'),
    },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <button hlmBtn type="button" variant="outline" (click)="show()">Default</button>
        <button hlmBtn type="button" variant="outline" (click)="success()">Success</button>
        <button hlmBtn type="button" variant="outline" (click)="info()">Info</button>
        <button hlmBtn type="button" variant="outline" (click)="warning()">Warning</button>
        <button hlmBtn type="button" variant="outline" (click)="error()">Error</button>
        <button hlmBtn type="button" variant="outline" (click)="loading()">Loading</button>
      </div>
      <hlm-toaster [position]="position" [richColors]="richColors" [closeButton]="closeButton" />
    `,
  }),
} satisfies Meta<HlmToaster>

export default meta
type Story = StoryObj<HlmToaster>

export const Default: Story = {}

export const RichColors: Story = { args: { richColors: true, closeButton: true } }
