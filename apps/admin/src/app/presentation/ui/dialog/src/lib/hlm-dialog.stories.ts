import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular'
import { HlmButton } from '@spartan-ng/helm/button'
import { HlmInput } from '@spartan-ng/helm/input'
import { HlmLabel } from '@spartan-ng/helm/label'
import { HlmDialogImports } from '../index'
import { HlmDialog } from './hlm-dialog'

const meta = {
  title: 'UI/Dialog',
  component: HlmDialog,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [HlmDialogImports, HlmButton, HlmInput, HlmLabel] })],
  parameters: { layout: 'centered' },
  render: () => ({
    template: `
      <hlm-dialog>
        <button hlmDialogTrigger hlmBtn type="button" variant="outline">Edit genre</button>
        <hlm-dialog-content *hlmDialogPortal="let ctx" class="sm:max-w-md">
          <hlm-dialog-header>
            <h2 hlmDialogTitle>Edit genre</h2>
            <p hlmDialogDescription>Rename the genre. Tracks keep their assignment.</p>
          </hlm-dialog-header>
          <div class="flex flex-col gap-2">
            <label hlmLabel for="dialog-genre-name">Name</label>
            <input hlmInput id="dialog-genre-name" type="text" value="Synthwave" />
          </div>
          <hlm-dialog-footer>
            <button hlmDialogClose hlmBtn type="button" variant="outline">Cancel</button>
            <button hlmBtn type="button">Save</button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </hlm-dialog>
    `,
  }),
} satisfies Meta<HlmDialog>

export default meta
type Story = StoryObj<HlmDialog>

export const Default: Story = {}

/** The confirm-delete shape the list pages use: driven by `state`, no close button. */
export const Destructive: Story = {
  render: () => ({
    template: `
      <hlm-dialog>
        <button hlmDialogTrigger hlmBtn type="button" variant="destructive">Delete genre</button>
        <hlm-dialog-content *hlmDialogPortal="let ctx" class="sm:max-w-md" [showCloseButton]="false">
          <hlm-dialog-header>
            <h2 hlmDialogTitle>Delete genre</h2>
            <p hlmDialogDescription>
              Permanently delete "Synthwave"? Nothing references it, but this cannot be undone.
            </p>
          </hlm-dialog-header>
          <hlm-dialog-footer>
            <button hlmDialogClose hlmBtn type="button" variant="outline">Cancel</button>
            <button hlmBtn type="button" variant="destructive">Delete genre</button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </hlm-dialog>
    `,
  }),
}

export const InitiallyOpen: Story = {
  render: () => ({
    template: `
      <hlm-dialog state="open">
        <hlm-dialog-content *hlmDialogPortal="let ctx" class="sm:max-w-md">
          <hlm-dialog-header>
            <h2 hlmDialogTitle>Session expired</h2>
            <p hlmDialogDescription>Sign in again to continue moderating.</p>
          </hlm-dialog-header>
          <hlm-dialog-footer>
            <button hlmDialogClose hlmBtn type="button">OK</button>
          </hlm-dialog-footer>
        </hlm-dialog-content>
      </hlm-dialog>
    `,
  }),
}
