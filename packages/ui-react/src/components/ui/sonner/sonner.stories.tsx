import type { StoryObj, StrictMeta } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Toaster, toast } from './sonner'

const TOAST_TIMESTAMP = '2026-01-01 12:00'

/**
 * An opinionated toast component for React.
 */
const meta = {
  title: 'ui/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    position: 'bottom-right',
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div className="flex min-h-96 items-center justify-center space-x-2">
      <Button
        onClick={() =>
          toast('Event has been created', {
            description: TOAST_TIMESTAMP,
            action: {
              label: 'Undo',
              onClick: action('Undo clicked'),
            },
          })
        }
      >
        Show Toast
      </Button>
      <Toaster {...args} />
    </div>
  ),
} satisfies StrictMeta<typeof Toaster>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the toaster.
 */
export const Default: Story = {}

export const Success: Story = {
  play: async () => { toast.success('Operation completed successfully!') },
}

export const ErrorToast: Story = {
  play: async () => { toast.error('Something went wrong.') },
}

export const Warning: Story = {
  play: async () => { toast.warning('Proceed with caution.') },
}

export const Info: Story = {
  play: async () => { toast.info('Here is some information.') },
}

export const PromiseToast: Story = {
  play: async () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: 'Loading…',
      success: 'Done!',
      error: 'Failed',
    })
  },
}

export const ShouldShowToast: Story = {
  name: 'when clicking Show Toast button, should show a toast',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)
    const triggerBtn = await canvasBody.findByRole('button', {
      name: /show/i,
    })

    await step('create a toast', async () => {
      await userEvent.click(triggerBtn)
      await waitFor(() => expect(canvasBody.queryByRole('listitem')).toBeInTheDocument())
    })

    await step('create more toasts', async () => {
      await userEvent.click(triggerBtn)
      await userEvent.click(triggerBtn)
      await waitFor(() => expect(canvasBody.getAllByRole('listitem')).toHaveLength(3))
    })
  },
}

export const ShouldCloseToast: Story = {
  name: 'when clicking the close button, should close the toast',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)
    const triggerBtn = await canvasBody.findByRole('button', {
      name: /show/i,
    })

    await step('create a toast', async () => {
      await userEvent.click(triggerBtn)
    })

    await step('close the toast', async () => {
      await userEvent.click(await canvasBody.findByRole('button', { name: /undo/i }))
      await waitFor(() => expect(canvasBody.queryByRole('listitem')).not.toBeInTheDocument())
    })
  },
}
