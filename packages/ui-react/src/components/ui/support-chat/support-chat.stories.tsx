import type { Meta, StoryObj } from '@storybook/react-vite'
import { SupportChat, type SupportChatLabels } from '@/components/ui/support-chat'

const labels: SupportChatLabels = {
  open: 'Open support chat',
  close: 'Close support chat',
  title: 'Support',
  placeholder: 'Ask a question',
  send: 'Send',
  emptyTitle: 'How can we help?',
  emptyDescription: 'Ask about your account, privacy or releases.',
  sources: 'Sources',
  operator: 'Bitrate team',
  status: {
    waiting_operator: 'An operator will reply here as soon as possible.',
    error: 'Something went wrong. Try again.',
    limited: 'Too many messages. Wait a moment.',
    offline: 'You are offline.',
  },
}

const conversation = [
  { id: '1', role: 'user' as const, text: 'How do I delete my account?' },
  {
    id: '2',
    role: 'assistant' as const,
    text: 'Email us from the address on your account with the subject "Delete my account".',
    sources: [{ title: 'Privacy Policy', url: 'https://bitrate.me/legal/privacy' }],
  },
]

/** The floating support chat of the web apps (#572): presentational, the app streams data in. */
const meta = {
  title: 'ui/SupportChat',
  component: SupportChat,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { labels, onSend: () => {}, defaultOpen: true, status: 'idle', messages: [] },
} satisfies Meta<typeof SupportChat>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Answered: Story = { args: { messages: conversation } }

export const Streaming: Story = {
  args: {
    status: 'streaming',
    messages: [...conversation, { id: '3', role: 'user', text: 'And my playlists?' }],
  },
}

export const WaitingForOperator: Story = {
  args: {
    status: 'waiting_operator',
    messages: [{ id: '1', role: 'user', text: 'I want to talk to a person' }],
  },
}

export const OperatorReplied: Story = {
  args: {
    messages: [
      { id: '1', role: 'user', text: 'I want to talk to a person' },
      { id: '2', role: 'operator', text: 'Hi, this is the Bitrate team. How can we help?' },
    ],
  },
}

export const Limited: Story = { args: { status: 'limited', messages: conversation } }

export const Failed: Story = { args: { status: 'error', messages: conversation } }

export const Offline: Story = { args: { status: 'offline', messages: conversation } }
