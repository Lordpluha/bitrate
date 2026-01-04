import { cn } from "@/lib/utils";
import { Root } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

interface LabelProps extends ComponentProps<typeof Root>, VariantProps<typeof labelVariants> {}

export const Label = (({ className, ...props }: LabelProps) => (
  <Root className={cn(labelVariants(), className)} {...props} />
));
