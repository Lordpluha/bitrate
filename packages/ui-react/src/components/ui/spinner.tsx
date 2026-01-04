import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import type { ComponentProps } from "react"

export function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}