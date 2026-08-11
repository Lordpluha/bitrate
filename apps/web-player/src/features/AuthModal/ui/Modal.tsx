'use client'

import { useOverlayFocus } from '@shared/hooks'
import { cn } from '@spotify/ui-react'
import type { ComponentProps } from 'react'

interface ModalProps extends ComponentProps<'div'> {
  ariaLabel?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const Modal = ({
  isOpen,
  onOpenChange: toggleIsOpen,
  children,
  className,
  ariaLabel = 'Dialog',
  ...dialogProps
}: ModalProps) => {
  const dialogRef = useOverlayFocus<HTMLDivElement>({
    isOpen,
    onClose: () => toggleIsOpen(false),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-hidden="true"
        className="absolute inset-0 w-screen bg-black/60 backdrop-blur-sm"
        onClick={() => toggleIsOpen(false)}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-label={ariaLabel}
        aria-modal="true"
        className={cn(
          'relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg shadow-xl',
          'animate-in zoom-in-95 duration-200',
          className,
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        {...dialogProps}
      >
        {children}
      </div>
    </div>
  )
}
