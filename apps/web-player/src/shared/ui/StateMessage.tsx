import { Button, cn } from '@bitrate/ui-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

/** A message action: a link to another page, or a button that acts in place. */
type StateMessageAction =
  | { href: string; label: string }
  | { label: string; onClick: () => void }

export type StateMessageProps = {
  className?: string
  description?: string
  icon: LucideIcon
  primary?: StateMessageAction
  secondary?: StateMessageAction
  title: string
  /** `error` tints the icon circle red; `neutral` keeps it on the secondary surface. */
  tone?: 'error' | 'neutral'
}

const ACTION_CLASS = 'h-9 px-6 text-sm font-medium'

const StateMessageButton = ({
  action,
  variant,
}: {
  action: StateMessageAction
  variant: 'primary' | 'outline'
}) =>
  'href' in action ? (
    <Button asChild className={ACTION_CLASS} variant={variant}>
      <Link href={action.href}>{action.label}</Link>
    </Button>
  ) : (
    <Button className={ACTION_CLASS} onClick={action.onClick} variant={variant}>
      {action.label}
    </Button>
  )

/**
 * The design system's State/Message (error, empty, offline): a 72px icon circle, an Unbounded
 * title, a short description and up to two actions, centred in the space it is given within a
 * 480px measure.
 */
export const StateMessage = ({
  className,
  description,
  icon: Icon,
  primary,
  secondary,
  title,
  tone = 'neutral',
}: StateMessageProps) => (
  <div
    aria-live={tone === 'error' ? 'assertive' : 'polite'}
    className={cn(
      'flex min-h-96 flex-1 flex-col items-center justify-center px-4',
      className,
    )}
    role={tone === 'error' ? 'alert' : 'status'}
  >
    <div className="flex w-full max-w-120 flex-col items-center gap-4 py-6 text-center">
      <span
        className={cn(
          'flex size-18 items-center justify-center rounded-full',
          tone === 'error'
            ? 'bg-error-surface text-error'
            : 'bg-secondary text-foreground',
        )}
      >
        <Icon aria-hidden="true" size={30} />
      </span>
      <h2 className="text-[28px] leading-[1.25] font-semibold text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {primary || secondary ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {primary ? (
            <StateMessageButton action={primary} variant="primary" />
          ) : null}
          {secondary ? (
            <StateMessageButton action={secondary} variant="outline" />
          ) : null}
        </div>
      ) : null}
    </div>
  </div>
)
