import { CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

type InlineNoticeProps = {
  body: ReactNode
  title: ReactNode
}

/** A success banner above a list, e.g. after a friend request was accepted. */
export const InlineNotice = ({ body, title }: InlineNoticeProps) => (
  <div
    className="flex items-start gap-3 rounded-[10px] border border-border bg-surface px-4 py-3"
    role="status"
  >
    <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-success" />
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="font-semibold text-foreground">{title}</span>
      <span className="text-muted-foreground">{body}</span>
    </div>
  </div>
)
