import { MessageCircle, Send, X } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'
import { Button } from '../button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '../empty'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Spinner } from '../spinner'
import { Textarea } from '../textarea'
import { SupportChatMessage, type SupportChatMessageData } from './support-chat-message'

/** What the chat is doing; drives the composer and the status line. */
export type SupportChatStatus =
  | 'idle'
  | 'sending'
  | 'streaming'
  | 'waiting_operator'
  | 'error'
  | 'limited'
  | 'offline'

/** Every text the widget shows; the app passes them translated. */
export interface SupportChatLabels {
  open: string
  close: string
  title: string
  placeholder: string
  send: string
  emptyTitle: string
  emptyDescription: string
  sources: string
  operator: string
  status: Record<'waiting_operator' | 'error' | 'limited' | 'offline', string>
}

export interface SupportChatProps {
  messages: SupportChatMessageData[]
  status: SupportChatStatus
  labels: SupportChatLabels
  onSend: (text: string) => void
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const BUSY: readonly SupportChatStatus[] = ['sending', 'streaming', 'offline']

/**
 * Floating support chat: a round button that opens a panel with the conversation and a
 * composer. Presentational; the app owns the API calls and passes messages and status.
 */
export function SupportChat({
  messages,
  status,
  labels,
  onSend,
  defaultOpen,
  onOpenChange,
}: SupportChatProps) {
  const [draft, setDraft] = useState('')
  const busy = BUSY.includes(status)
  const notice =
    status in labels.status ? labels.status[status as keyof typeof labels.status] : null

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    onSend(text)
    setDraft('')
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) submit(event)
  }

  return (
    <Popover defaultOpen={defaultOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      <PopoverTrigger asChild>
        <Button
          aria-label={labels.open}
          className="fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg"
          size="icon"
          variant="primary"
        >
          <MessageCircle />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex h-[min(32rem,80vh)] w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 p-3"
        sideOffset={8}
      >
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">{labels.title}</h2>
          <PopoverTrigger asChild>
            <Button aria-label={labels.close} size="icon" variant="ghost">
              <X />
            </Button>
          </PopoverTrigger>
        </header>
        {messages.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {messages.map((message) => (
              <SupportChatMessage
                key={message.id}
                message={message}
                operatorLabel={labels.operator}
                sourcesLabel={labels.sources}
              />
            ))}
          </ol>
        )}
        {notice && (
          <p className="text-muted-foreground text-xs" role="status">
            {notice}
          </p>
        )}
        <form className="flex items-end gap-2" onSubmit={submit}>
          <Textarea
            className="max-h-32 min-h-10 flex-1 resize-none"
            maxLength={2000}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={labels.placeholder}
            rows={1}
            value={draft}
          />
          <Button aria-label={labels.send} disabled={busy} size="icon" type="submit">
            {status === 'streaming' || status === 'sending' ? <Spinner /> : <Send />}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
