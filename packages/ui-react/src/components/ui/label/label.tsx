import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

export interface LabelProps extends ComponentProps<'label'>, VariantProps<typeof labelVariants> {}

export const Label = ({ className, ...props }: LabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is forwarded via ...props
  <label className={cn(labelVariants(), className)} {...props} />
)
