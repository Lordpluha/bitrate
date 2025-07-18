import * as React from 'react'

import { cn } from '@spotify/ui/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'ui-flex ui-min-h-[80px] ui-w-full ui-rounded-md ui-border ui-border-slate-200 ui-bg-white ui-px-3 ui-py-2 ui-text-base ui-ring-offset-white placeholder:ui-text-slate-500 focus-visible:ui-outline-none focus-visible:ui-ring-2 focus-visible:ui-ring-slate-950 focus-visible:ui-ring-offset-2 disabled:ui-cursor-not-allowed disabled:ui-opacity-50 md:ui-text-sm dark:ui-border-slate-800 dark:ui-bg-slate-950 dark:ui-ring-offset-slate-950 dark:placeholder:ui-text-slate-400 dark:focus-visible:ui-ring-slate-300',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
