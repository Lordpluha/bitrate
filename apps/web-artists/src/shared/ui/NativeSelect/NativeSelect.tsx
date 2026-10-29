import { cn } from '@bitrate/ui-react'
import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'

interface NativeSelectProps extends ComponentProps<'select'> {
  /** Classes for the wrapper, which carries the control's width. */
  wrapperClassName?: string
}

/**
 * The platform select in the workspace look. It stays native so it works inside the modal
 * `<dialog>` top layer, where a portalled listbox would be inert. The chevron sits clear of the
 * edge, and options get explicit colours: browsers draw the open list themselves and would
 * otherwise inherit the control's muted text on a light popup.
 */
export function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <span className={cn('artist-select', wrapperClassName)}>
      <select className={cn('artist-select-control', className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="artist-select-chevron" />
    </span>
  )
}
