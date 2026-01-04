import { cn } from "@/lib/utils";
import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";

export const Avatar = ({ className, ...props }: ComponentProps<typeof Root>) => (
  <Root
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
);

export const AvatarImage = ({ className, ...props }: ComponentProps<typeof Image>) => (
  <Image
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
);

export const AvatarFallback = ({ className, ...props }: ComponentProps<typeof Fallback>) => (
  <Fallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800",
      className,
    )}
    {...props}
  />
);

