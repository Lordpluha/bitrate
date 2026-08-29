import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-badge-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-badge-default-surface text-badge-default-foreground hover:bg-badge-default-surface/80',
        secondary:
          'border-transparent bg-badge-secondary-surface text-badge-secondary-foreground hover:bg-badge-secondary-surface/80',
        destructive:
          'border-transparent bg-badge-destructive-surface text-badge-destructive-foreground hover:bg-badge-destructive-surface/80',
        outline: 'text-badge-outline-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
