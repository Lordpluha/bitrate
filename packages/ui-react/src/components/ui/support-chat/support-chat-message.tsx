import { cn } from '@/lib/utils'

/** One message of the support chat as the widget shows it. */
export interface SupportChatMessageData {
  id: string
  role: 'user' | 'assistant' | 'operator'
  text: string
  sources?: { title: string; url?: string }[]
}

/** A chat bubble: the user's on the right, the assistant's and the operator's on the left. */
export function SupportChatMessage({
  message,
  sourcesLabel,
  operatorLabel,
}: {
  message: SupportChatMessageData
  sourcesLabel: string
  operatorLabel: string
}) {
  const own = message.role === 'user'
  return (
    <li className={cn('flex flex-col gap-1', own ? 'items-end' : 'items-start')}>
      {message.role === 'operator' && (
        <span className="text-xs text-muted-foreground">{operatorLabel}</span>
      )}
      <p
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm',
          own ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
        )}
      >
        {message.text}
      </p>
      {message.sources && message.sources.length > 0 && (
        <div className="max-w-[85%] text-xs text-muted-foreground">
          <span>{sourcesLabel}: </span>
          {message.sources.map((source, index) => (
            <span key={source.url ?? source.title}>
              {index > 0 && ', '}
              {source.url ? (
                <a className="underline" href={source.url} rel="noreferrer" target="_blank">
                  {source.title}
                </a>
              ) : (
                source.title
              )}
            </span>
          ))}
        </div>
      )}
    </li>
  )
}
