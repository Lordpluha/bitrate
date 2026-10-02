import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>

/**
 * A single on/off choice, built on the Base UI checkbox so keyboard, focus and
 * `aria-checked` behaviour come from the primitive. Pair it with a `Label` through
 * `id`/`htmlFor` or by wrapping both in a `<label>`.
 */
export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      'flex size-5 shrink-0 items-center justify-center rounded-sm border border-input-border bg-input-contrast-surface text-input-contrast-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-black',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <svg
        aria-hidden="true"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)
