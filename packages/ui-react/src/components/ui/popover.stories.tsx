import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * Displays rich content in a portal, triggered by a button.
 */
const meta = {
  title: 'ui/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {},

  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the popover.
 */
export const Default: Story = {}

export const ShouldOpenClose: Story = {
  name: 'when clicking the trigger, should open and close the popover',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)
    const canvas = within(canvasElement)

    await step('click the trigger to open the popover', async () => {
      const trigger = canvas.getByRole('button', { name: /open/i })
      await userEvent.click(trigger)
      await expect(canvasBody.findByRole('dialog')).resolves.toBeInTheDocument()
    })

    await step('click the trigger to close the popover', async () => {
      const trigger = canvas.getByRole('button', { name: /open/i })
      await userEvent.click(trigger)
      const dialogs = canvasBody.queryAllByRole('dialog')
      const closedDialog = dialogs.find((dialog) => dialog.getAttribute('data-state') === 'closed')
      expect(closedDialog).toBeInTheDocument()
    })
  },
}
