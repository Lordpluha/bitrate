import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SupportChat, type SupportChatLabels } from './support-chat'

const labels: SupportChatLabels = {
  open: 'Open support chat',
  close: 'Close support chat',
  title: 'Support',
  placeholder: 'Ask a question',
  send: 'Send',
  emptyTitle: 'How can we help?',
  emptyDescription: 'Ask about your account or releases.',
  sources: 'Sources',
  operator: 'Bitrate team',
  status: {
    waiting_operator: 'An operator will reply here.',
    error: 'Something went wrong. Try again.',
    limited: 'Too many messages. Wait a moment.',
    offline: 'You are offline.',
  },
}

describe('SupportChat', () => {
  it('shows the conversation with the sources of an answer', () => {
    render(
      <SupportChat
        defaultOpen
        labels={labels}
        status="idle"
        onSend={() => {}}
        messages={[
          { id: '1', role: 'user', text: 'How do I delete my account?' },
          {
            id: '2',
            role: 'assistant',
            text: 'Email us.',
            sources: [{ title: 'Privacy Policy', url: 'https://bitrate.me/legal/privacy' }],
          },
        ]}
      />,
    )

    expect(screen.getByText('How do I delete my account?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://bitrate.me/legal/privacy',
    )
  })

  it('sends the typed message on Enter and clears the field', async () => {
    const onSend = vi.fn()
    render(<SupportChat defaultOpen labels={labels} status="idle" messages={[]} onSend={onSend} />)

    expect(screen.getByText('How can we help?')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('Ask a question'), 'Hello{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hello')
    expect(screen.getByPlaceholderText('Ask a question')).toHaveValue('')
  })

  it('blocks sending while a reply is streaming', () => {
    render(
      <SupportChat
        defaultOpen
        labels={labels}
        status="streaming"
        messages={[]}
        onSend={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it.each([
    ['waiting_operator', 'An operator will reply here.'],
    ['limited', 'Too many messages. Wait a moment.'],
  ] as const)('tells the user when the status is %s', (status, text) => {
    render(
      <SupportChat defaultOpen labels={labels} status={status} messages={[]} onSend={() => {}} />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(text)
  })
})
