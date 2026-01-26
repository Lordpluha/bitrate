import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { useInputContext } from "./input-context"

export const inputVariants = cva(
  "px-3 py-2 flex w-full rounded-md border text-base ring-offset-white placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-white text-slate-900 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
        contrast: "border-grey-500 bg-contrast text-textContrast focus-visible:ring-slate-950",
        search: "bg-grey-900 text-grey-200 placeholder:text-grey-500 rounded-full h-12",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface InputProps extends ComponentProps<"input">, VariantProps<typeof inputVariants> {}

export const Input = ({ className, type, variant, value, onChange, onFocus, onBlur, ...props }: InputProps) => {
  const context = useInputContext()

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    context?.setFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    context?.setFocused(false)
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    context?.setValue(e.target.value.length > 0)
    onChange?.(e)
  }

  React.useEffect(() => {
    if (value !== undefined && context?.setValue) {
      context.setValue(String(value).length > 0)
    }
  }, [value, context])

  return (
    <input
      type={type}
      className={cn(inputVariants({ variant, className }))}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  )
}
