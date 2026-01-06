import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "./separator"

function ItemGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: hz
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item [a]:hover:bg-slate-100/50 focus-visible:border-slate-950 focus-visible:ring-slate-950/50 [a]:transition-colors flex flex-wrap items-center rounded-md border border-slate-200 border-transparent text-sm outline-none transition-colors duration-100 focus-visible:ring-[3px] dark:[a]:hover:bg-slate-800/50 dark:focus-visible:border-slate-300 dark:focus-visible:ring-slate-300/50 dark:border-slate-800",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-slate-200 dark:border-slate-800",
        muted: "bg-slate-100/50 dark:bg-slate-800/50",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-slate-100 size-8 rounded-sm border border-slate-200 [&_svg:not([class*='size-'])]:size-4 dark:bg-slate-800 dark:border-slate-800",
        image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn("flex w-fit items-center gap-2 text-sm font-medium leading-snug", className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-slate-500 line-clamp-2 text-balance text-sm font-normal leading-normal dark:text-slate-400",
        "[&>a:hover]:text-slate-900 [&>a]:underline [&>a]:underline-offset-4 dark:[&>a:hover]:text-slate-50",
        className,
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />
  )
}

function ItemHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
}
