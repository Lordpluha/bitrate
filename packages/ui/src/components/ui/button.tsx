import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ButtonHTMLAttributes, FC, Ref } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        destructive:
          "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary:
          "bg-slate-800 text-slate-900 hover:bg-slate-800/80 dark:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-100/80",
        primary: "bg-green-500 text-text hover:opacity-80 transition-[0.3s]",
        contrast:
          "bg-contrast text-textContrast border-2 border-grey-500 border-solid hover:opacity-80 transition-[0.3s]",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "disabled"> {
  ref?: Ref<HTMLButtonElement>;
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  className,
  children,
  isLoading = false,
  disabled,
  variant,
  size,
  ref,
  ...props
}) => (
  <button
    className={cn(buttonVariants({ variant, size, className, disabled }))}
    aria-disabled={disabled}
    disabled={disabled}
    ref={ref}
    {...props}
  >
    {children}
    <div
      className={clsx(
        isLoading
          ? `block w-6 h-6 relative
      before:content-[""] before:absolute before:mt-1 before:left-2
      before:w-5 before:h-5 before:rounded-full before:border-2
      before:border-solid before:border-[rgb(25, 25, 25)]
      before:border-t-transparent before:animate-spin`
          : "hidden",
      )}
    />
  </button>
);
