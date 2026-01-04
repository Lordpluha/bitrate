
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export const Table = ({ className, ...props }: ComponentProps<'table'>) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
)

export const TableHeader = ({ className, ...props }: ComponentProps<'thead'>) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
)

export const TableBody = ({ className, ...props }: ComponentProps<'tbody'>) => (
  <tbody
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
)

export const TableFooter = ({ className, ...props }: ComponentProps<'tfoot'>) => (
  <tfoot
    className={cn(
      "border-t bg-slate-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-slate-800/50",
      className
    )}
    {...props}
  />
)

export const TableRow = ({ className, ...props }: ComponentProps<'tr'>) => (
  <tr
    className={cn(
      "border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800",
      className
    )}
    {...props}
  />
)

export const TableHead = ({ className, ...props }: ComponentProps<'th'>) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400",
      className
    )}
    {...props}
  />
)

export const TableCell = ({ className, ...props }: ComponentProps<'td'>) => (
  <td
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
)

export const TableCaption = ({ className, ...props }: ComponentProps<'caption'>) => (
  <caption
    className={cn("mt-4 text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
)