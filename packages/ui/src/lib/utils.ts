import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Parameters<typeof clsx>[0][]) {
  return twMerge(clsx(inputs))
}
