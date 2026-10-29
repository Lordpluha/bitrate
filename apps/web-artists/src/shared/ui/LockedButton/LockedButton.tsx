import {
  Button,
  type ButtonProps,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@bitrate/ui-react'
import { useId } from 'react'

interface LockedButtonProps
  extends Pick<ButtonProps, 'variant' | 'size' | 'className' | 'children'> {
  /** Why the action is unavailable right now; shown on hover and keyboard focus. */
  reason: string
}

/**
 * An action that exists but cannot run yet. It stays focusable and hoverable — a native
 * `disabled` button receives neither — so the reason can be read, and it never acts.
 */
export function LockedButton({
  reason,
  className,
  children,
  ...button
}: LockedButtonProps) {
  const id = useId()
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...button}
            aria-describedby={id}
            aria-disabled="true"
            className={cn('cursor-not-allowed opacity-50', className)}
            onClick={(event) => event.preventDefault()}
            type="button"
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-xs">{reason}</TooltipContent>
      </Tooltip>
      <span className="sr-only" id={id}>
        {reason}
      </span>
    </>
  )
}
