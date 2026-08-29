import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Table = ({ className, ...props }: ComponentProps<'table'>) => (
  <div className="relative w-full overflow-auto">
    <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
)

export const TableHeader = ({ className, ...props }: ComponentProps<'thead'>) => (
  <thead className={cn('[&_tr]:border-b', className)} {...props} />
)

export const TableBody = ({ className, ...props }: ComponentProps<'tbody'>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
)

export const TableFooter = ({ className, ...props }: ComponentProps<'tfoot'>) => (
  <tfoot
    className={cn(
      'border-t bg-collection-row-muted/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
)

export const TableRow = ({ className, ...props }: ComponentProps<'tr'>) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-collection-row-hover/50 data-[state=selected]:bg-collection-row-selected',
      className,
    )}
    {...props}
  />
)

export const TableHead = ({ className, ...props }: ComponentProps<'th'>) => (
  <th
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-collection-text-secondary [&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
)

export const TableCell = ({ className, ...props }: ComponentProps<'td'>) => (
  <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
)

export const TableCaption = ({ className, ...props }: ComponentProps<'caption'>) => (
  <caption className={cn('mt-4 text-sm text-collection-text-secondary', className)} {...props} />
)
