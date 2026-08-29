'use client'

import { useTheme } from 'next-themes'
import type { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = ComponentProps<typeof Sonner>

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-toast-surface group-[.toaster]:text-toast-foreground group-[.toaster]:border-toast-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-toast-description',
          actionButton:
            'group-[.toast]:bg-toast-action-surface group-[.toast]:text-toast-action-foreground',
          cancelButton:
            'group-[.toast]:bg-toast-cancel-surface group-[.toast]:text-toast-cancel-foreground',
        },
      }}
      {...props}
    />
  )
}

export type {
  Action,
  ExternalToast,
  ToastClassnames,
  ToasterProps,
  ToastT,
  ToastToDismiss,
} from 'sonner'
export { toast, useSonner } from 'sonner'
